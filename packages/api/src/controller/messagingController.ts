import { FastifyInstance, FastifyReply } from 'fastify';
import { supabase } from '../lib/supabase';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import {
  createConversationSchema,
  createMessageSchema,
  getConversationsSchema,
  getMessagesSchema,
  markMessagesReadSchema,
} from '../schemas/messaging';
import {
  Conversation,
  ConversationQueryParams,
  CreateConversationRequest,
  CreateMessageRequest,
  Message,
  MessageQueryParams,
} from '../types/messaging';

// Helper function to format conversation response with populated fields
function formatConversationResponse(
  row: any,
  otherUser?: any,
  location?: any,
  unreadCount: number = 0
): Conversation {
  return {
    id: row.id,
    location_id: row.location_id,
    participant_ids: row.participant_ids,
    last_message: row.last_message,
    last_message_at: row.last_message_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    other_user: otherUser
      ? {
          id: otherUser.id,
          email: otherUser.email,
        }
      : undefined,
    location: location
      ? {
          id: location.id,
          title: location.title,
          address: location.address,
          gallery: location.gallery || [],
        }
      : undefined,
    unread_count: unreadCount,
  };
}

// Helper function to format message response
function formatMessageResponse(row: any): Message {
  return {
    id: row.id,
    conversation_id: row.conversation_id,
    sender_id: row.sender_id,
    content: row.content,
    is_read: row.is_read,
    created_at: row.created_at,
  };
}

export default async function messagingController(fastify: FastifyInstance) {
  // GET /conversations - List user's conversations
  fastify.get(
    '/conversations',
    {
      schema: getConversationsSchema,
      preHandler: authMiddleware,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const query = request.query as ConversationQueryParams;
        const userId = request.user_id!;

        console.log('🔍 Fetching conversations for user:', userId);

        // Build query to get conversations where user is a participant
        let supabaseQuery = supabase
          .from('conversations')
          .select('*')
          .contains('participant_ids', [userId]);

        // Apply filters
        if (query.location_id) {
          supabaseQuery = supabaseQuery.eq('location_id', query.location_id);
        }

        // Apply pagination and ordering
        const limit = query.limit || 20;
        const offset = query.offset || 0;
        supabaseQuery = supabaseQuery
          .range(offset, offset + limit - 1)
          .order('last_message_at', { ascending: false });

        const { data: conversations, error, count } = await supabaseQuery;

        console.log('📋 Conversations query result:', {
          count: conversations?.length,
          error: error?.message,
        });

        if (error) {
          console.error('Error fetching conversations:', error);
          return reply.status(500).send({
            success: false,
            message: 'Failed to fetch conversations',
          });
        }

        // Get unread message counts for each conversation
        const conversationIds = conversations?.map(c => c.id) || [];
        let unreadMap = new Map();

        if (conversationIds.length > 0) {
          const { data: unreadCounts } = await supabase
            .from('messages')
            .select('conversation_id')
            .in('conversation_id', conversationIds)
            .eq('sender_id', userId)
            .neq('sender_id', userId) // Messages not sent by current user
            .eq('is_read', false);

          // Count unread messages per conversation
          const countMap = new Map();
          unreadCounts?.forEach((item: any) => {
            const count = countMap.get(item.conversation_id) || 0;
            countMap.set(item.conversation_id, count + 1);
          });
          unreadMap = countMap;
        }

        // Get additional data for conversations (users and locations)
        const formattedConversations: Conversation[] = [];
        if (conversations) {
          for (const conv of conversations) {
            // Get other user ID (the participant who is not the current user)
            const otherUserId = conv.participant_ids.find((id: string) => id !== userId);
            let otherUser = { id: otherUserId, email: 'user@example.com' }; // Fallback

            // Try to get user email from auth.users (if accessible)
            if (otherUserId) {
              const { data: userData } = await supabase
                .from('auth.users')
                .select('email')
                .eq('id', otherUserId)
                .single();

              if (userData) {
                otherUser = { id: otherUserId, email: userData.email };
              }
            }

            // Get location data if exists
            let location = null;
            if (conv.location_id) {
              const { data: locationData } = await supabase
                .from('locations')
                .select('id, title, address, gallery')
                .eq('id', conv.location_id)
                .single();
              location = locationData;
            }

            const unreadCount = unreadMap.get(conv.id) || 0;

            formattedConversations.push(
              formatConversationResponse(conv, otherUser, location, unreadCount)
            );
          }
        }

        console.log('✅ Returning conversations:', formattedConversations.length);

        reply.send({
          success: true,
          data: formattedConversations,
          total: count || formattedConversations.length,
        });
      } catch (error) {
        console.error('Unexpected error:', error);
        reply.status(500).send({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  );

  // POST /conversations - Create or get conversation
  fastify.post(
    '/conversations',
    {
      schema: createConversationSchema,
      preHandler: authMiddleware,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const body = request.body as CreateConversationRequest;
        const userId = request.user_id!;

        if (body.receiver_id === userId) {
          return reply.status(400).send({
            success: false,
            message: 'Cannot create conversation with yourself',
          });
        }

        console.log('🆕 Creating conversation:', {
          userId,
          receiverId: body.receiver_id,
          locationId: body.location_id,
        });

        // Use the database function to get or create conversation
        const { data: conversationId, error: funcError } = await supabase.rpc(
          'get_or_create_conversation',
          {
            p_location_id: body.location_id || null,
            p_user_id_1: userId,
            p_user_id_2: body.receiver_id,
          }
        );

        if (funcError) {
          console.error('Error creating conversation:', funcError);
          return reply.status(500).send({
            success: false,
            message: 'Failed to create conversation',
          });
        }

        // If initial message provided, send it
        if (body.initial_message) {
          const { error: messageError } = await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: userId,
            content: body.initial_message,
          });

          if (messageError) {
            console.error('Error sending initial message:', messageError);
            // Don't fail the conversation creation, just log the error
          }
        }

        // Fetch the created/existing conversation
        const { data: conversation, error: fetchError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();

        if (fetchError || !conversation) {
          console.error('Error fetching conversation:', fetchError);
          return reply.status(500).send({
            success: false,
            message: 'Failed to fetch conversation details',
          });
        }

        // Get other user data
        const otherUserId = conversation.participant_ids.find((id: string) => id !== userId);
        const otherUser = { id: otherUserId, email: 'user@example.com' }; // Fallback

        // Get location data if exists
        let location = null;
        if (conversation.location_id) {
          const { data: locationData } = await supabase
            .from('locations')
            .select('id, title, address, gallery')
            .eq('id', conversation.location_id)
            .single();
          location = locationData;
        }

        const formattedConversation = formatConversationResponse(
          conversation,
          otherUser,
          location,
          0
        );

        reply.status(201).send({
          success: true,
          data: formattedConversation,
          message: 'Conversation created successfully',
        });
      } catch (error) {
        console.error('Unexpected error:', error);
        reply.status(500).send({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  );

  // GET /conversations/:conversationId/messages - Get messages in conversation
  fastify.get(
    '/conversations/:conversationId/messages',
    {
      schema: getMessagesSchema,
      preHandler: authMiddleware,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { conversationId } = request.params as { conversationId: string };
        const query = request.query as MessageQueryParams;
        const userId = request.user_id!;

        // Verify user is part of this conversation
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('participant_ids')
          .eq('id', conversationId)
          .single();

        if (convError || !conversation) {
          return reply.status(404).send({
            success: false,
            message: 'Conversation not found',
          });
        }

        if (!conversation.participant_ids.includes(userId)) {
          return reply.status(403).send({
            success: false,
            message: 'Access denied to this conversation',
          });
        }

        // Build query for messages
        let supabaseQuery = supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId);

        // Apply filters
        if (query.before) {
          supabaseQuery = supabaseQuery.lt('created_at', query.before);
        }

        // Apply pagination and ordering
        const limit = query.limit || 50;
        const offset = query.offset || 0;
        supabaseQuery = supabaseQuery
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false });

        const { data: messages, error, count } = await supabaseQuery;

        if (error) {
          console.error('Error fetching messages:', error);
          return reply.status(500).send({
            success: false,
            message: 'Failed to fetch messages',
          });
        }

        const formattedMessages = messages?.map(formatMessageResponse) || [];

        reply.send({
          success: true,
          data: formattedMessages,
          total: count || formattedMessages.length,
        });
      } catch (error) {
        console.error('Unexpected error:', error);
        reply.status(500).send({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  );

  // POST /messages - Send a message
  fastify.post(
    '/messages',
    {
      schema: createMessageSchema,
      preHandler: authMiddleware,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const body = request.body as CreateMessageRequest;
        const userId = request.user_id!;

        // Verify conversation exists and user is part of it
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('participant_ids')
          .eq('id', body.conversation_id)
          .single();

        if (convError || !conversation) {
          return reply.status(404).send({
            success: false,
            message: 'Conversation not found',
          });
        }

        if (!conversation.participant_ids.includes(userId)) {
          return reply.status(403).send({
            success: false,
            message: 'Access denied to this conversation',
          });
        }

        // Insert the message
        const { data: message, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: body.conversation_id,
            sender_id: userId,
            content: body.content,
          })
          .select()
          .single();

        if (error) {
          console.error('Error sending message:', error);
          return reply.status(500).send({
            success: false,
            message: 'Failed to send message',
          });
        }

        const formattedMessage = formatMessageResponse(message);

        reply.status(201).send({
          success: true,
          data: formattedMessage,
          message: 'Message sent successfully',
        });
      } catch (error) {
        console.error('Unexpected error:', error);
        reply.status(500).send({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  );

  // PUT /conversations/:conversationId/read - Mark messages as read
  fastify.put(
    '/conversations/:conversationId/read',
    {
      schema: markMessagesReadSchema,
      preHandler: authMiddleware,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { conversationId } = request.params as { conversationId: string };
        const userId = request.user_id!;

        // Verify user is part of this conversation
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('participant_ids')
          .eq('id', conversationId)
          .single();

        if (convError || !conversation) {
          return reply.status(404).send({
            success: false,
            message: 'Conversation not found',
          });
        }

        if (!conversation.participant_ids.includes(userId)) {
          return reply.status(403).send({
            success: false,
            message: 'Access denied to this conversation',
          });
        }

        // Mark all unread messages as read for this user (messages not sent by user)
        const { data, error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', userId) // Only messages not sent by current user
          .eq('is_read', false)
          .select('id');

        if (error) {
          console.error('Error marking messages as read:', error);
          return reply.status(500).send({
            success: false,
            message: 'Failed to mark messages as read',
          });
        }

        reply.send({
          success: true,
          message: 'Messages marked as read',
          updated_count: data?.length || 0,
        });
      } catch (error) {
        console.error('Unexpected error:', error);
        reply.status(500).send({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  );
}
