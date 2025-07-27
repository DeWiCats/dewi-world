// Simple UUID generator for mock data
const generateUUID = () => 'mock-' + Math.random().toString(36).substr(2, 9);

export interface Conversation {
  id: string;
  user_one_id: string;
  user_two_id: string;
  location_id?: string;
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

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  updated_at: string;
  read_at?: string;
}

export interface CreateMessageRequest {
  conversation_id: string;
  receiver_id: string;
  message: string;
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

// Mock data for testing
const mockUsers = [
  { id: 'user-1', email: 'peroni.alt@email.com' },
  { id: 'user-2', email: 'alice.martinez@email.com' },
  { id: 'user-3', email: 'bob.chen@email.com' },
  { id: 'user-4', email: 'sarah.williams@email.com' },
  { id: 'user-5', email: 'mike.johnson@email.com' },
];

const mockLocations = [
  {
    id: 'location-1',
    title: 'Downtown Office Building',
    address: '123 Main St, San Francisco, CA',
    gallery: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'],
  },
  {
    id: 'location-2',
    title: 'Rooftop Installation Site',
    address: '456 Market St, San Francisco, CA',
    gallery: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'],
  },
  {
    id: 'location-3',
    title: 'Warehouse Complex',
    address: '789 Industrial Blvd, Oakland, CA',
    gallery: ['https://images.unsplash.com/photo-1565192264418-e4a6f21a96bc?w=400'],
  },
];

// Generate realistic timestamps
const generateTimestamp = (minutesAgo: number) => {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
};

let mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    user_one_id: 'current-user',
    user_two_id: 'user-1',
    location_id: 'location-1',
    last_message: 'Hey I have a helium hotspot ready to deploy',
    last_message_at: generateTimestamp(6),
    created_at: generateTimestamp(120),
    updated_at: generateTimestamp(6),
    other_user: mockUsers[0],
    location: mockLocations[0],
    unread_count: 2,
  },
  {
    id: 'conv-2',
    user_one_id: 'current-user',
    user_two_id: 'user-2',
    location_id: 'location-2',
    last_message: 'Perfect! When can we schedule the installation?',
    last_message_at: generateTimestamp(15),
    created_at: generateTimestamp(240),
    updated_at: generateTimestamp(15),
    other_user: mockUsers[1],
    location: mockLocations[1],
    unread_count: 0,
  },
  {
    id: 'conv-3',
    user_one_id: 'current-user',
    user_two_id: 'user-3',
    location_id: 'location-3',
    last_message: 'The warehouse looks great for multiple hotspots',
    last_message_at: generateTimestamp(45),
    created_at: generateTimestamp(360),
    updated_at: generateTimestamp(45),
    other_user: mockUsers[2],
    location: mockLocations[2],
    unread_count: 1,
  },
  {
    id: 'conv-4',
    user_one_id: 'current-user',
    user_two_id: 'user-4',
    location_id: 'location-1',
    last_message: 'Thanks for the quick response!',
    last_message_at: generateTimestamp(90),
    created_at: generateTimestamp(480),
    updated_at: generateTimestamp(90),
    other_user: mockUsers[3],
    location: mockLocations[0],
    unread_count: 0,
  },
  {
    id: 'conv-5',
    user_one_id: 'current-user',
    user_two_id: 'user-5',
    location_id: 'location-2',
    last_message: 'Let me check the power requirements first',
    last_message_at: generateTimestamp(180),
    created_at: generateTimestamp(600),
    updated_at: generateTimestamp(180),
    other_user: mockUsers[4],
    location: mockLocations[1],
    unread_count: 0,
  },
];

let mockMessages: Message[] = [
  // Conversation 1 messages
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender_id: 'current-user',
    receiver_id: 'user-1',
    message: 'Hey!',
    created_at: generateTimestamp(120),
    updated_at: generateTimestamp(120),
    read_at: generateTimestamp(118),
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1',
    sender_id: 'current-user',
    receiver_id: 'user-1',
    message: 'I have a helium hotspot ready to deploy',
    created_at: generateTimestamp(118),
    updated_at: generateTimestamp(118),
    read_at: generateTimestamp(115),
  },
  {
    id: 'msg-3',
    conversation_id: 'conv-1',
    sender_id: 'user-1',
    receiver_id: 'current-user',
    message: 'Hey',
    created_at: generateTimestamp(10),
    updated_at: generateTimestamp(10),
  },
  {
    id: 'msg-4',
    conversation_id: 'conv-1',
    sender_id: 'current-user',
    receiver_id: 'user-1',
    message: 'Hey!',
    created_at: generateTimestamp(8),
    updated_at: generateTimestamp(8),
    read_at: generateTimestamp(7),
  },
  {
    id: 'msg-5',
    conversation_id: 'conv-1',
    sender_id: 'current-user',
    receiver_id: 'user-1',
    message: 'I have a helium hotspot ready to deploy',
    created_at: generateTimestamp(7),
    updated_at: generateTimestamp(7),
    read_at: generateTimestamp(6),
  },
  {
    id: 'msg-6',
    conversation_id: 'conv-1',
    sender_id: 'user-1',
    receiver_id: 'current-user',
    message: 'Hey',
    created_at: generateTimestamp(6),
    updated_at: generateTimestamp(6),
  },
  {
    id: 'msg-7',
    conversation_id: 'conv-1',
    sender_id: 'user-1',
    receiver_id: 'current-user',
    message: 'Hey',
    created_at: generateTimestamp(5),
    updated_at: generateTimestamp(5),
  },

  // Conversation 2 messages
  {
    id: 'msg-8',
    conversation_id: 'conv-2',
    sender_id: 'current-user',
    receiver_id: 'user-2',
    message: 'Your rooftop site looks perfect for a large installation.',
    created_at: generateTimestamp(240),
    updated_at: generateTimestamp(240),
    read_at: generateTimestamp(210),
  },
  {
    id: 'msg-9',
    conversation_id: 'conv-2',
    sender_id: 'user-2',
    receiver_id: 'current-user',
    message: 'Perfect! When can we schedule the installation?',
    created_at: generateTimestamp(15),
    updated_at: generateTimestamp(15),
    read_at: generateTimestamp(15),
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockMessagingAPI {
  // Get user's conversations
  async getConversations(params?: ConversationQueryParams): Promise<ConversationsResponse> {
    await delay(300);

    let conversations = [...mockConversations];

    // Apply filters
    if (params?.location_id) {
      conversations = conversations.filter(c => c.location_id === params.location_id);
    }

    // Sort by last message time (most recent first)
    conversations.sort(
      (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );

    // Apply pagination
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;
    const paginatedConversations = conversations.slice(offset, offset + limit);

    return {
      success: true,
      data: paginatedConversations,
      total: conversations.length,
    };
  }

  // Create or get conversation
  async createConversation(
    conversationData: CreateConversationRequest
  ): Promise<ConversationResponse> {
    await delay(400);

    // Check if conversation already exists
    const existingConv = mockConversations.find(
      c =>
        (c.user_one_id === 'current-user' &&
          c.user_two_id === conversationData.receiver_id &&
          c.location_id === conversationData.location_id) ||
        (c.user_two_id === 'current-user' &&
          c.user_one_id === conversationData.receiver_id &&
          c.location_id === conversationData.location_id)
    );

    if (existingConv) {
      return {
        success: true,
        data: existingConv,
        message: 'Conversation already exists',
      };
    }

    // Create new conversation
    const otherUser = mockUsers.find(u => u.id === conversationData.receiver_id);
    const location = mockLocations.find(l => l.id === conversationData.location_id);

    const newConversation: Conversation = {
      id: generateUUID(),
      user_one_id: 'current-user',
      user_two_id: conversationData.receiver_id,
      location_id: conversationData.location_id,
      last_message: conversationData.initial_message,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      other_user: otherUser,
      location: location,
      unread_count: 0,
    };

    mockConversations.unshift(newConversation);

    // Send initial message if provided
    if (conversationData.initial_message) {
      const newMessage: Message = {
        id: generateUUID(),
        conversation_id: newConversation.id,
        sender_id: 'current-user',
        receiver_id: conversationData.receiver_id,
        message: conversationData.initial_message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockMessages.push(newMessage);
    }

    return {
      success: true,
      data: newConversation,
      message: 'Conversation created successfully',
    };
  }

  // Get messages in a conversation
  async getMessages(
    conversationId: string,
    params?: MessageQueryParams
  ): Promise<MessagesResponse> {
    await delay(200);

    let messages = mockMessages.filter(m => m.conversation_id === conversationId);

    // Apply filters
    if (params?.before) {
      messages = messages.filter(m => new Date(m.created_at) < new Date(params.before!));
    }

    // Sort by created_at descending (newest first for pagination)
    messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply pagination
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    const paginatedMessages = messages.slice(offset, offset + limit);

    return {
      success: true,
      data: paginatedMessages,
      total: messages.length,
    };
  }

  // Send a message
  async sendMessage(messageData: CreateMessageRequest): Promise<MessageResponse> {
    await delay(300);

    const newMessage: Message = {
      id: generateUUID(),
      conversation_id: messageData.conversation_id,
      sender_id: 'current-user',
      receiver_id: messageData.receiver_id,
      message: messageData.message,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockMessages.push(newMessage);

    // Update conversation's last message
    const conversation = mockConversations.find(c => c.id === messageData.conversation_id);
    if (conversation) {
      conversation.last_message = messageData.message;
      conversation.last_message_at = new Date().toISOString();
      conversation.updated_at = new Date().toISOString();
    }

    return {
      success: true,
      data: newMessage,
      message: 'Message sent successfully',
    };
  }

  // Mark messages as read
  async markMessagesAsRead(
    conversationId: string
  ): Promise<{ success: boolean; message: string; updated_count: number }> {
    await delay(200);

    const unreadMessages = mockMessages.filter(
      m => m.conversation_id === conversationId && m.receiver_id === 'current-user' && !m.read_at
    );

    const now = new Date().toISOString();
    unreadMessages.forEach(message => {
      message.read_at = now;
    });

    // Update conversation unread count
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unread_count = 0;
    }

    return {
      success: true,
      message: 'Messages marked as read',
      updated_count: unreadMessages.length,
    };
  }

  // Subscribe to real-time updates (mock)
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    // Mock real-time subscription
    console.log(`Subscribed to messages for conversation: ${conversationId}`);

    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribed from messages for conversation: ${conversationId}`);
    };
  }

  // Subscribe to conversation updates (mock)
  subscribeToConversations(callback: (conversations: Conversation[]) => void) {
    // Mock real-time subscription
    console.log('Subscribed to conversation updates');

    // Return unsubscribe function
    return () => {
      console.log('Unsubscribed from conversation updates');
    };
  }
}

export const mockMessagingAPI = new MockMessagingAPI();
