import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  Conversation,
  ConversationQueryParams,
  ConversationResponse,
  ConversationsResponse,
  CreateConversationRequest,
  CreateMessageRequest,
  Message,
  MessageQueryParams,
  MessageResponse,
  MessagesResponse,
  mockMessagingAPI,
} from '@/utils/mockMessaging';
import { supabase } from '@/utils/supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3006';

// Real API implementation
class RealMessagingAPI {
  private getAuthHeaders(): { Authorization: string } {
    const { getAuthHeaders } = require('@/lib/authHelpers');
    return getAuthHeaders();
  }

  async getConversations(params?: ConversationQueryParams): Promise<ConversationsResponse> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error('Please log in to view conversations');
      }

      const headers = await this.getAuthHeaders();

      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.offset) searchParams.append('offset', params.offset.toString());
      if (params?.location_id) searchParams.append('location_id', params.location_id);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/messaging/conversations?${searchParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch conversations');
    }
  }

  async createConversation(
    conversationData: CreateConversationRequest
  ): Promise<ConversationResponse> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/messaging/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(conversationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async getMessages(
    conversationId: string,
    params?: MessageQueryParams
  ): Promise<MessagesResponse> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('No authentication token');
      }

      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.offset) searchParams.append('offset', params.offset.toString());
      if (params?.before) searchParams.append('before', params.before);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/messaging/conversations/${conversationId}/messages?${searchParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(messageData: CreateMessageRequest): Promise<MessageResponse> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('No authentication token');
      }

      const url = `${API_BASE_URL}/api/v1/messaging/messages`;

      console.log('Sending conversation message with following parameters:');
      console.log('URL', url);
      console.log('Body', messageData);
      console.log('Headers', headers);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async markMessagesAsRead(
    conversationId: string
  ): Promise<{ success: boolean; message: string; updated_count: number }> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('No authentication token');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/messaging/conversations/${conversationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Subscribe to real-time messages using Supabase Realtime
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    // Check if user is authenticated before subscribing
    const { user, session } = useAuthStore.getState();
    if (!user || !session?.access_token) {
      console.warn('Cannot subscribe to messages: user not authenticated');
      return () => {};
    }

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        payload => {
          console.log('New message received:', payload.new);
          callback(payload.new as Message);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Subscribe to conversation updates
  subscribeToConversations(callback: (conversations: Conversation[]) => void) {
    const { user } = useAuthStore.getState();
    if (!user) return () => {};

    const channel = supabase
      .channel('conversations:updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(user_one_id.eq.${user.id},user_two_id.eq.${user.id})`,
        },
        async payload => {
          console.log('Conversation updated:', payload);
          // Refetch conversations when there's an update
          try {
            const response = await this.getConversations();
            if (response.success) {
              callback(response.data);
            }
          } catch (error) {
            console.error('Error refetching conversations:', error);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}

const realAPI = new RealMessagingAPI();

// Unified API that switches between mock and real based on mockMode
export class MessagingAPI {
  async getConversations(params?: ConversationQueryParams): Promise<ConversationsResponse> {
    const { mockMode } = useAppStore.getState();
    if (mockMode) {
      return mockMessagingAPI.getConversations(params);
    } else {
      try {
        const { user } = useAuthStore.getState();
        if (!user) {
          throw new Error('Please log in to view conversations');
        }
        return realAPI.getConversations(params);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        if (error instanceof Error && error.message.includes('log in')) {
          throw error;
        }
        throw new Error('Failed to load conversations. Please try again.');
      }
    }
  }

  async createConversation(
    conversationData: CreateConversationRequest
  ): Promise<ConversationResponse> {
    const { mockMode } = useAppStore.getState();
    if (mockMode) {
      return mockMessagingAPI.createConversation(conversationData);
    } else {
      return realAPI.createConversation(conversationData);
    }
  }

  async getMessages(
    conversationId: string,
    params?: MessageQueryParams
  ): Promise<MessagesResponse> {
    const { mockMode } = useAppStore.getState();
    if (mockMode) {
      return mockMessagingAPI.getMessages(conversationId, params);
    } else {
      return realAPI.getMessages(conversationId, params);
    }
  }

  async sendMessage(messageData: CreateMessageRequest): Promise<MessageResponse> {
    const { mockMode } = useAppStore.getState();
    if (mockMode) {
      return mockMessagingAPI.sendMessage(messageData);
    } else {
      return realAPI.sendMessage(messageData);
    }
  }

  async markMessagesAsRead(
    conversationId: string
  ): Promise<{ success: boolean; message: string; updated_count: number }> {
    const { mockMode } = useAppStore.getState();
    if (mockMode) {
      return mockMessagingAPI.markMessagesAsRead(conversationId);
    } else {
      return realAPI.markMessagesAsRead(conversationId);
    }
  }

  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    const { mockMode } = useAppStore.getState();
    if (mockMode) {
      return mockMessagingAPI.subscribeToMessages(conversationId, callback);
    } else {
      return realAPI.subscribeToMessages(conversationId, callback);
    }
  }

  subscribeToConversations(callback: (conversations: Conversation[]) => void) {
    const { mockMode } = useAppStore.getState();
    if (mockMode) {
      return mockMessagingAPI.subscribeToConversations(callback);
    } else {
      return realAPI.subscribeToConversations(callback);
    }
  }
}

export const messagingAPI = new MessagingAPI();

// Export types for convenience
export type {
  Conversation,
  ConversationQueryParams,
  ConversationResponse,
  ConversationsResponse,
  CreateConversationRequest,
  CreateMessageRequest,
  Message,
  MessageQueryParams,
  MessageResponse,
  MessagesResponse
};

