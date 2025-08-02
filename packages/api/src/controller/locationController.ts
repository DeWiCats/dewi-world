import { FastifyInstance, FastifyReply } from 'fastify';
import { validateAndGeocodeAddress } from '../lib/geocoding';
import { LocationInsert, LocationRow, LocationUpdate, supabase } from '../lib/supabase';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import {
  createLocationSchema,
  deleteLocationSchema,
  getLocationSchema,
  getLocationsSchema,
  updateLocationSchema,
} from '../schemas/location';
import {
  CreateLocationRequest,
  LocationPost,
  LocationQueryParams,
  UpdateLocationRequest,
} from '../types/location';

// Helper function to convert database row to API response format
function formatLocationResponse(row: LocationRow): LocationPost {
  return {
    id: row.id,
    owner_id: row.owner_id,
    title: row.title,
    description: row.description || '',
    address: row.address,
    formatted_address: row.formatted_address || undefined,
    latitude: row.latitude,
    longitude: row.longitude,
    place_id: row.place_id || undefined,
    deployable_hardware: row.deployable_hardware,
    price: Number(row.price),
    is_negotiable: row.is_negotiable,
    gallery: row.gallery,
    rating: row.rating ? Number(row.rating) : undefined,
    distance: 0, // Will be calculated client-side
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export default async function locationController(fastify: FastifyInstance) {
  // GET /api/v1/locations - Get all locations with filtering
  fastify.get(
    '/',
    {
      schema: getLocationsSchema,
      preHandler: authMiddleware,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const query = request.query as LocationQueryParams;

        // Start building the Supabase query
        let supabaseQuery = supabase.from('locations').select('*');

        // Apply filters
        if (query.hardware) {
          supabaseQuery = supabaseQuery.contains('deployable_hardware', [query.hardware]);
        }

        if (query.min_price !== undefined) {
          supabaseQuery = supabaseQuery.gte('price', query.min_price);
        }

        if (query.max_price !== undefined) {
          supabaseQuery = supabaseQuery.lte('price', query.max_price);
        }

        if (query.negotiable !== undefined) {
          supabaseQuery = supabaseQuery.eq('is_negotiable', query.negotiable);
        }

        // Apply pagination
        const limit = query.limit || 20;
        const offset = query.offset || 0;
        supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

        // Order by created_at desc
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

        const { data, error, count } = await supabaseQuery;

        if (error) {
          console.error('Supabase error:', error);
          return reply.status(500).send({
            success: false,
            message: 'Database error occurred',
          });
        }

        const formattedLocations = data?.map(formatLocationResponse) || [];

        reply.send({
          success: true,
          data: formattedLocations,
          total: count || formattedLocations.length,
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

  // GET /api/v1/locations/:id - Get single location
  fastify.get(
    '/:id',
    {
      schema: getLocationSchema,
      preHandler: authMiddleware,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };

        const { data, error } = await supabase.from('locations').select('*').eq('id', id).single();

        if (error) {
          if (error.code === 'PGRST116') {
            return reply.status(404).send({
              success: false,
              message: 'Location not found',
            });
          }
          console.error('Supabase error:', error);
          return reply.status(500).send({
            success: false,
            message: 'Database error occurred',
          });
        }

        reply.send({
          success: true,
          data: formatLocationResponse(data),
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

  // POST /api/v1/locations - Create new location
  fastify.post(
    '/',
    {
      schema: createLocationSchema,
      preHandler: authMiddleware,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const locationData = request.body as CreateLocationRequest;

        // Validate and geocode the address
        const geocodingResult = await validateAndGeocodeAddress(locationData.address);

        if (!geocodingResult.success || !geocodingResult.data) {
          return reply.status(400).send({
            success: false,
            message: geocodingResult.error || 'Invalid address provided',
          });
        }

        const { latitude, longitude, formatted_address, place_id } = geocodingResult.data;

        const insertData: LocationInsert = {
          owner_id: request.user_id!,
          title: locationData.title,
          description: locationData.description,
          address: locationData.address,
          formatted_address,
          latitude,
          longitude,
          place_id,
          deployable_hardware: locationData.deployable_hardware,
          price: locationData.price,
          is_negotiable: locationData.is_negotiable,
          gallery: locationData.gallery || [],
          rating: locationData.rating,
        };

        const { data, error } = await supabase
          .from('locations')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          return reply.status(500).send({
            success: false,
            message: 'Failed to create location',
          });
        }

        reply.status(201).send({
          success: true,
          data: formatLocationResponse(data),
          message: 'Location created successfully',
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

  // PUT /api/v1/locations/:id - Update location
  fastify.put(
    '/:id',
    {
      schema: updateLocationSchema,
      preHandler: authMiddleware,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const updateData = request.body as UpdateLocationRequest;

        // First check if location exists and user owns it
        const { data: existingLocation, error: fetchError } = await supabase
          .from('locations')
          .select('owner_id')
          .eq('id', id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            return reply.status(404).send({
              success: false,
              message: 'Location not found',
            });
          }
          console.error('Supabase error:', fetchError);
          return reply.status(500).send({
            success: false,
            message: 'Database error occurred',
          });
        }

        // Check ownership
        if (existingLocation.owner_id !== request.user_id) {
          return reply.status(403).send({
            success: false,
            message: 'Not authorized to update this location',
          });
        }

        // Prepare update data (only include fields that are provided)
        const updateFields: LocationUpdate = {};
        if (updateData.title !== undefined) updateFields.title = updateData.title;
        if (updateData.description !== undefined) updateFields.description = updateData.description;
        if (updateData.address !== undefined) updateFields.address = updateData.address;
        if (updateData.deployable_hardware !== undefined)
          updateFields.deployable_hardware = updateData.deployable_hardware;
        if (updateData.price !== undefined) updateFields.price = updateData.price;
        if (updateData.is_negotiable !== undefined)
          updateFields.is_negotiable = updateData.is_negotiable;
        if (updateData.gallery !== undefined) updateFields.gallery = updateData.gallery;
        if (updateData.rating !== undefined) updateFields.rating = updateData.rating;

        const { data, error } = await supabase
          .from('locations')
          .update(updateFields)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          return reply.status(500).send({
            success: false,
            message: 'Failed to update location',
          });
        }

        reply.send({
          success: true,
          data: formatLocationResponse(data),
          message: 'Location updated successfully',
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

  // DELETE /api/v1/locations/:id - Delete location
  fastify.delete(
    '/:id',
    {
      schema: deleteLocationSchema,
      preHandler: authMiddleware,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };

        // First check if location exists and user owns it
        const { data: existingLocation, error: fetchError } = await supabase
          .from('locations')
          .select('owner_id')
          .eq('id', id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            return reply.status(404).send({
              success: false,
              message: 'Location not found',
            });
          }
          console.error('Supabase error:', fetchError);
          return reply.status(500).send({
            success: false,
            message: 'Database error occurred',
          });
        }

        // Check ownership
        if (existingLocation.owner_id !== request.user_id) {
          return reply.status(403).send({
            success: false,
            message: 'Not authorized to delete this location',
          });
        }

        const { error } = await supabase.from('locations').delete().eq('id', id);

        if (error) {
          console.error('Supabase error:', error);
          return reply.status(500).send({
            success: false,
            message: 'Failed to delete location',
          });
        }

        reply.send({
          success: true,
          message: 'Location deleted successfully',
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
