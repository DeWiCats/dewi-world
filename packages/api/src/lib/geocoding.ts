import { createClient } from '@google/maps';

const googleMapsClient = createClient({
  key: process.env.GOOGLE_PLACES_API_KEY || '',
});

export interface GeocodingResult {
  success: boolean;
  data?: {
    latitude: number;
    longitude: number;
    formatted_address: string;
    place_id: string;
    address_components: any[];
  };
  error?: string;
}

/**
 * Validates an address and returns geocoded coordinates
 */
export async function validateAndGeocodeAddress(address: string): Promise<GeocodingResult> {
  try {
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return {
        success: false,
        error: 'Google Places API key not configured',
      };
    }

    const response = await new Promise<any>((resolve, reject) => {
      googleMapsClient.geocode({ address }, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (!response.json.results || response.json.results.length === 0) {
      return {
        success: false,
        error: 'Address not found or invalid',
      };
    }

    const result = response.json.results[0];
    const location = result.geometry.location;

    return {
      success: true,
      data: {
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
        address_components: result.address_components,
      },
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      error: 'Failed to validate address',
    };
  }
}

/**
 * Get detailed place information by place_id
 */
export async function getPlaceDetails(placeId: string): Promise<GeocodingResult> {
  try {
    const request = {
      placeid: placeId,
      fields: ['formatted_address', 'geometry', 'address_component'],
    };

    const response = await new Promise<any>((resolve, reject) => {
      (googleMapsClient as any).place(request, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const place = response.json.result;
    const location = place.geometry.location;

    return {
      success: true,
      data: {
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: place.formatted_address,
        place_id: placeId,
        address_components: place.address_components || [],
      },
    };
  } catch (error) {
    console.error('Place details error:', error);
    return {
      success: false,
      error: 'Failed to get place details',
    };
  }
}
