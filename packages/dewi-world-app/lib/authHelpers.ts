import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Get authentication headers from Zustand auth store
 */
export function getAuthHeaders(): { Authorization: string } {
  const { session, hydrated } = useAuthStore.getState();

  console.log('🔑 getAuthHeaders called:', {
    hydrated,
    hasSession: !!session,
    hasToken: !!session?.access_token,
  });

  if (!hydrated) {
    throw new Error('Auth store not yet hydrated. Please wait.');
  }

  if (!session?.access_token) {
    throw new Error('Authentication required. Please log in.');
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const { user, session, hydrated } = useAuthStore.getState();
  console.log('🔓 isAuthenticated called:', {
    hydrated,
    hasUser: !!user,
    hasSession: !!session,
    hasToken: !!session?.access_token,
  });

  if (!hydrated) {
    console.log('🔓 Auth store not hydrated yet');
    return false;
  }

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

/**
 * Get current session from auth store
 */
export function getCurrentSession() {
  const { session } = useAuthStore.getState();
  if (!session) {
    throw new Error('No active session found');
  }
  return session;
}

/**
 * Handle authentication errors consistently
 */
export function handleAuthError(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message.includes('Authentication required') ||
      error.message.includes('Please log in')
    ) {
      return error.message;
    }

    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return 'Please log in again to continue.';
    }

    if (error.message.includes('403') || error.message.includes('forbidden')) {
      return 'You do not have permission to perform this action.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Require authentication before proceeding
 */
export function requireAuth(): void {
  if (!isAuthenticated()) {
    throw new Error('Authentication required. Please log in.');
  }
}
