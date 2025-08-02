import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.'
  );
}

// Create Supabase client with service role key for server-side operations
// This bypasses RLS policies and allows full database access
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Supabase Database Types
export interface LocationRow {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  address: string;
  formatted_address: string | null; // Google-validated address
  latitude: number; // Geocoded latitude
  longitude: number; // Geocoded longitude
  place_id: string | null; // Google Places ID
  deployable_hardware: string[];
  price: number;
  is_negotiable: boolean;
  gallery: string[];
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface LocationInsert {
  owner_id: string;
  title: string;
  description?: string;
  address: string;
  formatted_address?: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  deployable_hardware: string[];
  price: number;
  is_negotiable: boolean;
  gallery: string[];
  rating?: number;
}

export interface LocationUpdate {
  title?: string;
  description?: string;
  address?: string;
  formatted_address?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  deployable_hardware?: string[];
  price?: number;
  is_negotiable?: boolean;
  gallery?: string[];
  rating?: number;
}
