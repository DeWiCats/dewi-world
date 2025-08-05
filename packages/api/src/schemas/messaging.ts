export const createMessageSchema = {
  body: {
    type: 'object',
    required: ['conversation_id', 'receiver_id', 'message'],
    properties: {
      conversation_id: {
        type: 'string',
        format: 'uuid',
        description: 'UUID of the conversation',
      },
      receiver_id: {
        type: 'string',
        format: 'uuid',
        description: 'UUID of the message receiver',
      },
      message: {
        type: 'string',
        minLength: 1,
        maxLength: 1000,
        description: 'Message content',
      },
    },
    additionalProperties: false,
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            conversation_id: { type: 'string', format: 'uuid' },
            sender_id: { type: 'string', format: 'uuid' },
            content: { type: 'string' },
            is_read: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        message: { type: 'string' },
      },
    },
    400: {
      type: 'object',
      properties: {
        success: { type: 'boolean', const: false },
        message: { type: 'string' },
      },
    },
  },
};

export const createConversationSchema = {
  body: {
    type: 'object',
    required: ['receiver_id'],
    properties: {
      receiver_id: {
        type: 'string',
        format: 'uuid',
        description: 'UUID of the other user in the conversation',
      },
      location_id: {
        type: 'string',
        format: 'uuid',
        description: 'Optional UUID of the location post this conversation is about',
      },
      initial_message: {
        type: 'string',
        minLength: 1,
        maxLength: 1000,
        description: 'Optional initial message to send',
      },
    },
    additionalProperties: false,
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_one_id: { type: 'string', format: 'uuid' },
            user_two_id: { type: 'string', format: 'uuid' },
            location_id: { type: 'string', format: 'uuid', nullable: true },
            last_message: { type: 'string', nullable: true },
            last_message_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        message: { type: 'string' },
      },
    },
  },
};

export const getConversationsSchema = {
  querystring: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
      },
      offset: {
        type: 'integer',
        minimum: 0,
        default: 0,
      },
      location_id: {
        type: 'string',
        format: 'uuid',
        description: 'Filter conversations by location',
      },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              user_one_id: { type: 'string', format: 'uuid' },
              user_two_id: { type: 'string', format: 'uuid' },
              location_id: { type: 'string', format: 'uuid', nullable: true },
              last_message: { type: 'string', nullable: true },
              last_message_at: { type: 'string', format: 'date-time' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
              other_user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string' },
                },
              },
              location: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  title: { type: 'string' },
                  address: { type: 'string' },
                  gallery: { type: 'array', items: { type: 'string' } },
                },
              },
              unread_count: { type: 'integer' },
            },
          },
        },
        total: { type: 'integer' },
      },
    },
  },
};

export const getMessagesSchema = {
  params: {
    type: 'object',
    required: ['conversationId'],
    properties: {
      conversationId: {
        type: 'string',
        format: 'uuid',
        description: 'UUID of the conversation',
      },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 50,
      },
      offset: {
        type: 'integer',
        minimum: 0,
        default: 0,
      },
      before: {
        type: 'string',
        format: 'date-time',
        description: 'Get messages before this timestamp',
      },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              conversation_id: { type: 'string', format: 'uuid' },
              sender_id: { type: 'string', format: 'uuid' },
              content: { type: 'string' },
              is_read: { type: 'boolean' },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'integer' },
      },
    },
  },
};

export const markMessagesReadSchema = {
  params: {
    type: 'object',
    required: ['conversationId'],
    properties: {
      conversationId: {
        type: 'string',
        format: 'uuid',
        description: 'UUID of the conversation',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        updated_count: { type: 'integer' },
      },
    },
  },
};
