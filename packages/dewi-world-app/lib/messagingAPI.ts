import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/utils/supabase';
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
} from './messagingTypes';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3006';

// Real API implementation
class RealMessagingAPI {
  private getAuthHeaders(): { Authorization: string } {
    const { getAuthHeaders } = require('@/lib/authHelpers');
    return getAuthHeaders();
  }

  async getConversation(conversationId: string): Promise<ConversationResponse> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('No authentication token');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/messaging/conversations/${conversationId}`,
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
      console.error('Error fetching conversation:', error);
      throw error;
    }
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
    const headers = await this.getAuthHeaders();

    try {
      const url = new URL(
        `${API_BASE_URL}/api/v1/messaging/conversations/${conversationId}/messages`
      );

      if (params?.limit) url.searchParams.append('limit', params.limit.toString());
      if (params?.offset) url.searchParams.append('offset', params.offset.toString());
      if (params?.before) url.searchParams.append('before', params.before);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.data,
        total: data.total,
        message: 'Messages fetched successfully',
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error instanceof Error ? error.message : 'Failed to fetch messages',
      };
    }
  }

  async sendMessage(messageData: CreateMessageRequest): Promise<MessageResponse> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('No authentication token');
      }

      const url = `${API_BASE_URL}/api/v1/messaging/messages`;

      console.log('📤 Sending conversation message with following parameters:');
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
    const headers = await this.getAuthHeaders();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/messaging/conversations/${conversationId}/read`,
        {
          method: 'PUT',
          headers: {
            ...headers,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        message: data.message,
        updated_count: data.updated_count,
      };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark messages as read',
        updated_count: 0,
      };
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
          filter: `participant_ids.cs.{${user.id}}`,
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

// Export the real API directly - no more mock mode
export const messagingAPI = new RealMessagingAPI();

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

