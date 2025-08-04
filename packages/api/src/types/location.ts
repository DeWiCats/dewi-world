export interface LocationPost {
  id: string;
  owner_id: string; // Supabase user ID
  title: string;
  description: string;
  address: string;
  formatted_address?: string; // Google-validated address
  latitude: number; // Geocoded latitude
  longitude: number; // Geocoded longitude
  place_id?: string; // Google Places ID
  deployable_hardware: string[]; // Array of tags/icons
  price: number;
  is_negotiable: boolean;
  gallery: string[]; // Array of image URLs
  rating?: number; // Optional, for sorting later
  distance: number; // Calculated client-side based on user location
  created_at?: string;
  updated_at?: string;
}

export interface CreateLocationRequest {
  title: string;
  description: string;
  address: string;
  deployable_hardware: string[];
  price: number;
  is_negotiable: boolean;
  gallery: string[];
  rating?: number;
  distance: number;
}

export interface UpdateLocationRequest {
  title?: string;
  description?: string;
  address?: string;
  deployable_hardware?: string[];
  price?: number;
  is_negotiable?: boolean;
  gallery?: string[];
  rating?: number;
  distance?: number;
}

export interface LocationQueryParams {
  hardware?: string; // Filter by hardware tag
  min_price?: number;
  max_price?: number;
  negotiable?: boolean;
  limit?: number;
  offset?: number;
  // Geospatial filtering
  latitude?: number;
  longitude?: number;
  radius_km?: number; // Radius in kilometers
  search?: string; // Text search
}

export interface LocationResponse {
  success: boolean;
  data: LocationPost | LocationPost[];
  message?: string;
  total?: number;
}

// GeoJSON types for the new geojson controller
export interface GeoJSONLocation {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
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
    owner_id: string;
  };
}

export interface GeoJSONResponse {
  type: 'FeatureCollection';
  features: GeoJSONLocation[];
}
