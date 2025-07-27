export interface LocationPost {
  id: string; // UUID
  owner_id: string; // Supabase user ID
  title: string;
  description: string;
  address: string;
  deployable_hardware: string[]; // Array of tags/icons
  price: number;
  is_negotiable: boolean;
  gallery: string[]; // Array of image URLs
  rating?: number; // Optional, for sorting later
  distance: number; // Mocked client-side for now
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
}

export interface LocationResponse {
  success: boolean;
  data: LocationPost | LocationPost[];
  message?: string;
  total?: number;
}
