import { getAuthHeaders, handleAuthError, requireAuth } from '@/lib/authHelpers';

export interface LocationProperties {
  id: string;
  name: string;
  description: string;
  address: string;
  price: number;
  is_negotiable: boolean;
  deployable_hardware: string[];
  gallery: string[];
  rating?: number;
  distance?: number;
  created_at?: string;
}

export interface GeoJSONLocation {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: LocationProperties;
}

export interface GeoJSONResponse {
  type: 'FeatureCollection';
  features: GeoJSONLocation[];
}

export interface LocationFetchParams {
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  hardware?: string;
  min_price?: number;
  max_price?: number;
  negotiable?: boolean;
  search?: string;
  limit?: number;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3006';

/**
 * Fetches locations as GeoJSON with optional radius-based filtering
 */
export async function fetchLocationsGeoJSON(
  params: LocationFetchParams = {}
): Promise<GeoJSONResponse> {
  try {
    requireAuth();

    const queryParams = new URLSearchParams();

    if (params.latitude !== undefined) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude !== undefined)
      queryParams.append('longitude', params.longitude.toString());
    if (params.radius_km !== undefined)
      queryParams.append('radius_km', params.radius_km.toString());
    if (params.hardware) queryParams.append('hardware', params.hardware);
    if (params.min_price !== undefined)
      queryParams.append('min_price', params.min_price.toString());
    if (params.max_price !== undefined)
      queryParams.append('max_price', params.max_price.toString());
    if (params.negotiable !== undefined)
      queryParams.append('negotiable', params.negotiable.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const headers = getAuthHeaders();
    const url = `${API_BASE_URL}/api/v1/geojson/locations?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching locations GeoJSON:', error);
    handleAuthError(error);
    throw error;
  }
}

/**
 * Searches locations as GeoJSON with radius filtering
 */
export async function searchLocationsGeoJSON(
  searchTerm: string,
  params: Omit<LocationFetchParams, 'search'> = {}
): Promise<GeoJSONResponse> {
  try {
    requireAuth();

    const queryParams = new URLSearchParams();
    queryParams.append('q', searchTerm);

    if (params.latitude !== undefined) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude !== undefined)
      queryParams.append('longitude', params.longitude.toString());
    if (params.radius_km !== undefined)
      queryParams.append('radius_km', params.radius_km.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const headers = getAuthHeaders();
    const url = `${API_BASE_URL}/api/v1/geojson/search?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching locations GeoJSON:', error);
    handleAuthError(error);
    throw error;
  }
}

/**
 * Converts legacy GeoJSON format to new API format for backward compatibility
 */
export function convertLegacyGeoJSON(legacyData: any): GeoJSONResponse {
  if (!legacyData || !legacyData.features || !Array.isArray(legacyData.features)) {
    console.warn('⚠️ Invalid legacy GeoJSON data, returning empty collection');
    return { type: 'FeatureCollection', features: [] };
  }

  try {
    const features: GeoJSONLocation[] = legacyData.features
      .map((feature: any) => {
        if (!feature || !feature.properties) {
          console.warn('⚠️ Invalid feature data, skipping:', feature);
          return null;
        }

        return {
          type: 'Feature',
          geometry: feature.geometry || { type: 'Point', coordinates: [0, 0] },
          properties: {
            id: (feature.properties.name || 'unknown').replace(/\s+/g, '_').toLowerCase(),
            name: feature.properties.name || 'Unknown Location',
            description: feature.properties.description || '',
            address: feature.properties.address || '',
            price: parseInt((feature.properties.deployment_cost || '0').replace(/[^\d]/g, '')) || 0,
            is_negotiable: true,
            deployable_hardware:
              (feature.properties.depin_hardware || []).map((hw: any) => hw?.name || 'Unknown') ||
              [],
            gallery: feature.properties.photos || [],
            rating: Math.floor(Math.random() * 2) + 4, // Random 4-5 rating for legacy data
            created_at: new Date().toISOString(),
          },
        };
      })
      .filter(Boolean); // Remove null entries

    return {
      type: 'FeatureCollection',
      features,
    };
  } catch (error) {
    console.error('❌ Error converting legacy GeoJSON:', error);
    return { type: 'FeatureCollection', features: [] };
  }
}
