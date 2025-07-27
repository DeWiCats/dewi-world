import {
  Conversation,
  ConversationQueryParams,
  CreateConversationRequest,
  CreateMessageRequest,
  Message,
  MessageQueryParams,
  messagingAPI,
} from '@/lib/messagingAPI';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCallback, useEffect, useRef, useState } from 'react';

// Hook for managing conversations list
export function useConversations(params?: ConversationQueryParams) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const subscriptionRef = useRef<(() => void) | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await messagingAPI.getConversations(params);

      if (response.success) {
        setConversations(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch conversations');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch conversations';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, params]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Setup real-time subscription
  useEffect(() => {
    if (!user) return;

    // Subscribe to conversation updates
    subscriptionRef.current = messagingAPI.subscribeToConversations(updatedConversations => {
      setConversations(updatedConversations);
    });

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [user]);

  const refreshConversations = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
  }, [fetchConversations]);

  const createConversation = useCallback(
    async (conversationData: CreateConversationRequest) => {
      try {
        setError(null);
        const response = await messagingAPI.createConversation(conversationData);

        if (response.success) {
          // Refresh conversations to include the new one
          await refreshConversations();
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to create conversation');
        }
      } catch (err) {
        console.error('Error creating conversation:', err);
        const message = err instanceof Error ? err.message : 'Failed to create conversation';
        setError(message);
        throw new Error(message);
      }
    },
    [refreshConversations]
  );

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      await messagingAPI.markMessagesAsRead(conversationId);

      // Update local state to reflect read status
      setConversations(prev =>
        prev.map(conv => (conv.id === conversationId ? { ...conv, unread_count: 0 } : conv))
      );
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  }, []);

  return {
    conversations,
    loading,
    error,
    refreshing,
    refreshConversations,
    createConversation,
    markConversationAsRead,
  };
}

// Hook for managing messages within a conversation
export function useMessages(conversationId: string, params?: MessageQueryParams) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { user } = useAuthStore();
  const subscriptionRef = useRef<(() => void) | null>(null);

  const fetchMessages = useCallback(
    async (loadMore: boolean = false) => {
      if (!user || !conversationId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        if (loadMore) {
          setLoadingMore(true);
        }

        const currentMessages = loadMore ? messages : [];
        const offset = loadMore ? currentMessages.length : 0;

        const response = await messagingAPI.getMessages(conversationId, {
          ...params,
          offset,
        });

        if (response.success) {
          const newMessages = response.data;

          if (loadMore) {
            // Append older messages (avoiding duplicates)
            const existingIds = new Set(currentMessages.map(m => m.id));
            const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));
            setMessages(prev => [...prev, ...uniqueNewMessages]);
          } else {
            setMessages(newMessages);
          }

          // Check if there are more messages to load
          setHasMore(newMessages.length === (params?.limit || 50));
        } else {
          throw new Error(response.message || 'Failed to fetch messages');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        const message = err instanceof Error ? err.message : 'Failed to fetch messages';
        setError(message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user, conversationId, params, messages]
  );

  // Initial fetch
  useEffect(() => {
    setMessages([]);
    setLoading(true);
    setHasMore(true);
    fetchMessages();
  }, [conversationId, user]);

  // Setup real-time subscription
  useEffect(() => {
    if (!user || !conversationId) return;

    // Subscribe to new messages in this conversation
    subscriptionRef.current = messagingAPI.subscribeToMessages(conversationId, newMessage => {
      setMessages(prev => {
        // Check if message already exists (avoid duplicates)
        const exists = prev.some(m => m.id === newMessage.id);
        if (exists) return prev;

        // Add new message to the beginning (newest first)
        return [newMessage, ...prev];
      });
    });

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [user, conversationId]);

  const sendMessage = useCallback(
    async (messageData: Omit<CreateMessageRequest, 'conversation_id'>) => {
      if (!conversationId) {
        throw new Error('No conversation ID');
      }

      try {
        setError(null);
        const response = await messagingAPI.sendMessage({
          ...messageData,
          conversation_id: conversationId,
        });

        if (response.success) {
          // Message will be added via real-time subscription
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to send message');
        }
      } catch (err) {
        console.error('Error sending message:', err);
        const message = err instanceof Error ? err.message : 'Failed to send message';
        setError(message);
        throw new Error(message);
      }
    },
    [conversationId]
  );

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    await fetchMessages(true);
  }, [hasMore, loadingMore, fetchMessages]);

  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      await messagingAPI.markMessagesAsRead(conversationId);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadingMore,
    sendMessage,
    loadMoreMessages,
    markAsRead,
  };
}

// Hook for managing typing indicators
export function useTypingIndicator(conversationId: string) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { user } = useAuthStore();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTyping = useCallback(() => {
    if (!user || isTyping) return;

    setIsTyping(true);

    // TODO: Implement real typing indicator with Supabase Presence
    console.log(`User ${user.id} started typing in conversation ${conversationId}`);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [user, isTyping, conversationId]);

  const stopTyping = useCallback(() => {
    if (!user || !isTyping) return;

    setIsTyping(false);

    // TODO: Implement real typing indicator with Supabase Presence
    console.log(`User ${user.id} stopped typing in conversation ${conversationId}`);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [user, isTyping, conversationId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    typingUsers,
    startTyping,
    stopTyping,
  };
}
