// TypeScript types that match the actual Supabase database schema

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  location_id?: string;
  participant_ids: string[];
  last_message?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;

  // Populated fields for API responses
  other_user?: {
    id: string;
    email?: string;
  };
  location?: {
    id: string;
    title: string;
    address: string;
    gallery: string[];
  };
  unread_count?: number;
}

export interface CreateMessageRequest {
  conversation_id: string;
  receiver_id: string;
  message: string; // Will be mapped to 'content' in backend
}

export interface CreateConversationRequest {
  receiver_id: string;
  location_id?: string;
  initial_message?: string;
}

export interface ConversationQueryParams {
  limit?: number;
  offset?: number;
  location_id?: string;
}

export interface MessageQueryParams {
  limit?: number;
  offset?: number;
  before?: string;
}

// API Response types
export interface ConversationsResponse {
  success: boolean;
  data: Conversation[];
  total: number;
  message?: string;
}

export interface MessagesResponse {
  success: boolean;
  data: Message[];
  total: number;
  message?: string;
}

export interface ConversationResponse {
  success: boolean;
  data: Conversation;
  message?: string;
}

export interface MessageResponse {
  success: boolean;
  data: Message;
  message?: string;
}
