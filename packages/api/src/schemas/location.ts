export const createLocationSchema = {
  body: {
    type: 'object',
    required: [
      'title',
      'description',
      'address',
      'deployable_hardware',
      'price',
      'is_negotiable',
      'gallery',
    ],
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', minLength: 1, maxLength: 2000 },
      address: { type: 'string', minLength: 1, maxLength: 500 },
      deployable_hardware: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
      },
      price: { type: 'number', minimum: 0 },
      is_negotiable: { type: 'boolean' },
      gallery: {
        type: 'array',
        items: { type: 'string', format: 'uri' },
      },
      rating: { type: 'number', minimum: 0, maximum: 5 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            owner_id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            address: { type: 'string' },
            deployable_hardware: { type: 'array', items: { type: 'string' } },
            price: { type: 'number' },
            is_negotiable: { type: 'boolean' },
            gallery: { type: 'array', items: { type: 'string' } },
            rating: { type: 'number' },
            distance: { type: 'number' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
          },
        },
        message: { type: 'string' },
      },
    },
  },
};

export const updateLocationSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', minLength: 1, maxLength: 2000 },
      address: { type: 'string', minLength: 1, maxLength: 500 },
      deployable_hardware: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
      },
      price: { type: 'number', minimum: 0 },
      is_negotiable: { type: 'boolean' },
      gallery: {
        type: 'array',
        items: { type: 'string', format: 'uri' },
      },
      rating: { type: 'number', minimum: 0, maximum: 5 },
      distance: { type: 'number', minimum: 0 },
    },
  },
};

export const getLocationSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
};

export const getLocationsSchema = {
  querystring: {
    type: 'object',
    properties: {
      hardware: { type: 'string' },
      min_price: { type: 'number', minimum: 0 },
      max_price: { type: 'number', minimum: 0 },
      negotiable: { type: 'boolean' },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
      offset: { type: 'number', minimum: 0, default: 0 },
    },
  },
};

export const deleteLocationSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
};
