import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/utils/supabase';

/**
 * Get authentication headers for API requests
 */
export async function getAuthHeaders(): Promise<{ Authorization: string }> {
  const { session } = useAuthStore.getState();

  if (!session?.access_token) {
    throw new Error('No active session found. Please log in.');
  }

  // Check if token is about to expire (within 5 minutes)
  const expiresAt = session.expires_at;
  if (expiresAt && expiresAt * 1000 - Date.now() < 5 * 60 * 1000) {
    console.warn('Token expires soon, attempting refresh...');

    try {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshData.session?.access_token) {
        throw new Error('Your session has expired. Please log in again.');
      }

      // Update the auth store with the new session
      useAuthStore.getState().setAuthState(refreshData.user, refreshData.session);

      return {
        Authorization: `Bearer ${refreshData.session.access_token}`,
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Your session has expired. Please log in again.');
    }
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const { user, session } = useAuthStore.getState();
  return !!(user && session?.access_token);
}

/**
 * Get current user from auth store
 */
export function getCurrentUser() {
  const { user } = useAuthStore.getState();
  if (!user) {
    throw new Error('No authenticated user found');
  }
  return user;
}
