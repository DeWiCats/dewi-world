import { FastifyInstance, FastifyReply } from 'fastify';
import { LocationRow, supabase } from '../lib/supabase';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import { GeoJSONLocation, GeoJSONResponse, LocationQueryParams } from '../types/location';

// Helper function to convert database row to GeoJSON feature
function formatGeoJSONFeature(row: LocationRow): GeoJSONLocation {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [row.longitude, row.latitude], // [lng, lat] for GeoJSON
    },
    properties: {
      id: row.id,
      name: row.title,
      description: row.description || '',
      address: row.formatted_address || row.address,
      price: Number(row.price),
      is_negotiable: row.is_negotiable,
      deployable_hardware: row.deployable_hardware,
      gallery: row.gallery,
      rating: row.rating ? Number(row.rating) : undefined,
      created_at: row.created_at,
    },
  };
}

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default async function geojsonController(fastify: FastifyInstance) {
  // GET /api/v1/geojson/locations - Get locations as GeoJSON with radius filtering
  fastify.get(
    '/locations',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            radius_km: { type: 'number', default: 50 },
            hardware: { type: 'string' },
            min_price: { type: 'number' },
            max_price: { type: 'number' },
            negotiable: { type: 'boolean' },
            search: { type: 'string' },
            limit: { type: 'number', default: 100 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['FeatureCollection'] },
              features: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['Feature'] },
                    geometry: {
                      type: 'object',
                      properties: {
                        type: { type: 'string', enum: ['Point'] },
                        coordinates: {
                          type: 'array',
                          items: { type: 'number' },
                          minItems: 2,
                          maxItems: 2,
                        },
                      },
                    },
                    properties: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
      preHandler: authMiddleware,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const query = request.query as LocationQueryParams;
        const {
          latitude,
          longitude,
          radius_km = 50,
          hardware,
          min_price,
          max_price,
          negotiable,
          search,
          limit = 100,
        } = query;

        // Start building the Supabase query
        let supabaseQuery = supabase.from('locations').select('*');

        // Apply text search if provided
        if (search) {
          supabaseQuery = supabaseQuery.or(
            `title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`
          );
        }

        // Apply filters
        if (hardware) {
          supabaseQuery = supabaseQuery.contains('deployable_hardware', [hardware]);
        }

        if (min_price !== undefined) {
          supabaseQuery = supabaseQuery.gte('price', min_price);
        }

        if (max_price !== undefined) {
          supabaseQuery = supabaseQuery.lte('price', max_price);
        }

        if (negotiable !== undefined) {
          supabaseQuery = supabaseQuery.eq('is_negotiable', negotiable);
        }

        // Note: PostGIS RPC functions require custom setup
        // For now, we'll use client-side filtering which works out of the box

        // Apply limit
        supabaseQuery = supabaseQuery.limit(limit);

        // Order by created_at desc
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

        const { data, error } = await supabaseQuery;

        if (error) {
          console.error('Supabase error:', error);
          return reply.status(500).send({
            success: false,
            message: 'Database error occurred',
          });
        }

        // If no PostGIS function, fall back to client-side distance filtering
        let filteredData = data || [];
        if (latitude !== undefined && longitude !== undefined && !error) {
          filteredData = (data || []).filter((location: LocationRow) => {
            const distance = calculateDistance(
              latitude,
              longitude,
              location.latitude,
              location.longitude
            );
            return distance <= radius_km;
          });
        }

        // Convert to GeoJSON format and add distance if user location provided
        const features: GeoJSONLocation[] = filteredData.map((location: LocationRow) => {
          const feature = formatGeoJSONFeature(location);

          // Add calculated distance if user coordinates provided
          if (latitude !== undefined && longitude !== undefined) {
            const distance = calculateDistance(
              latitude,
              longitude,
              location.latitude,
              location.longitude
            );
            feature.properties.distance = Math.round(distance * 100) / 100; // Round to 2 decimal places
          }

          return feature;
        });

        const geoJsonResponse: GeoJSONResponse = {
          type: 'FeatureCollection',
          features,
        };

        reply.send(geoJsonResponse);
      } catch (error) {
        console.error('Unexpected error:', error);
        reply.status(500).send({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  );

  // GET /api/v1/geojson/search - Search locations with radius filtering
  fastify.get(
    '/search',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['q'],
          properties: {
            q: { type: 'string', minLength: 1 },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            radius_km: { type: 'number', default: 50 },
            limit: { type: 'number', default: 20 },
          },
        },
      },
      preHandler: authMiddleware,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const query = request.query as LocationQueryParams & { q: string };
        const { q: searchTerm, latitude, longitude, radius_km = 50, limit = 20 } = query;

        // Build search query
        let supabaseQuery = supabase
          .from('locations')
          .select('*')
          .or(
            `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`
          )
          .limit(limit)
          .order('created_at', { ascending: false });

        const { data, error } = await supabaseQuery;

        if (error) {
          console.error('Supabase error:', error);
          return reply.status(500).send({
            success: false,
            message: 'Search error occurred',
          });
        }

        // Apply client-side distance filtering if coordinates provided
        let filteredData = data || [];
        if (latitude !== undefined && longitude !== undefined) {
          filteredData = (data || []).filter((location: LocationRow) => {
            const distance = calculateDistance(
              latitude,
              longitude,
              location.latitude,
              location.longitude
            );
            return distance <= radius_km;
          });
        }

        // Convert to GeoJSON and sort by distance if applicable
        const features: GeoJSONLocation[] = filteredData
          .map((location: LocationRow) => {
            const feature = formatGeoJSONFeature(location);

            if (latitude !== undefined && longitude !== undefined) {
              const distance = calculateDistance(
                latitude,
                longitude,
                location.latitude,
                location.longitude
              );
              feature.properties.distance = Math.round(distance * 100) / 100;
            }

            return feature;
          })
          .sort((a, b) => {
            // Sort by distance if available, otherwise by creation date
            if (a.properties.distance !== undefined && b.properties.distance !== undefined) {
              return a.properties.distance - b.properties.distance;
            }
            return 0;
          });

        const geoJsonResponse: GeoJSONResponse = {
          type: 'FeatureCollection',
          features,
        };

        reply.send(geoJsonResponse);
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
