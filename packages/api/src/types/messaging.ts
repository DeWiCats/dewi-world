export interface Conversation {
  id: string;
  location_id: string;
  participant_ids: string[];
  last_message?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;

  // Populated fields
  other_user?: {
    id: string;
    email: string;
  };
  location?: {
    id: string;
    title: string;
    address: string;
    gallery: string[];
  };
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateConversationRequest {
  receiver_id: string;
  location_id?: string;
  initial_message?: string;
}

export interface CreateMessageRequest {
  conversation_id: string;
  message: string;
}

export interface ConversationQueryParams {
  location_id?: string;
  limit?: number;
  offset?: number;
}

export interface MessageQueryParams {
  before?: string;
  limit?: number;
  offset?: number;
}

// Response types
export interface ConversationsResponse {
  success: boolean;
  data: Conversation[];
  total: number;
}

export interface MessagesResponse {
  success: boolean;
  data: Message[];
  total: number;
}

export interface ConversationResponse {
  success: boolean;
  data: Conversation;
  message: string;
}

export interface MessageResponse {
  success: boolean;
  data: Message;
  message: string;
}
