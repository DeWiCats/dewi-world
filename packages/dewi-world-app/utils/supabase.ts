import { createClient } from '@supabase/supabase-js';

/**
 * Supabase is assumed to be pre-configured – update env vars as needed.
 * Persisting sessions is disabled because Zustand now owns persistence.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
