import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Test authentication functionality
 */
export async function testAuth() {
  console.log('🧪 Testing authentication...');

  try {
    // Check current session from Zustand store
    const { user, session } = useAuthStore.getState();

    if (!user || !session) {
      console.log('⚠️ No active session found in auth store');
      return false;
    }

    console.log('✅ Session found in auth store:', {
      user: user.email,
      expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A',
      token_preview: session.access_token.substring(0, 20) + '...',
    });

    // Test API call with token from auth store
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3006';
    const response = await fetch(`${API_BASE_URL}/api/v1/messaging/conversations`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful:', {
        status: response.status,
        conversations_count: data.data?.length || 0,
      });
      return true;
    } else {
      const errorData = await response.text();
      console.error('❌ API call failed:', {
        status: response.status,
        error: errorData,
      });
      return false;
    }
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return false;
  }
}

/**
 * Debug current auth state
 */
export async function debugAuthState() {
  console.log('🔍 Debugging auth state...');

  // Check Zustand store
  const { user, session } = useAuthStore.getState();
  console.log('Zustand store state:', {
    user: user
      ? {
          id: user.id,
          email: user.email,
        }
      : null,
    session: session
      ? {
          has_access_token: !!session.access_token,
          expires_at: session.expires_at
            ? new Date(session.expires_at * 1000).toISOString()
            : 'N/A',
          token_preview: session.access_token?.substring(0, 20) + '...',
        }
      : null,
  });
}

// Export for easy testing in dev
if (__DEV__) {
  (global as any).testAuth = testAuth;
  (global as any).debugAuthState = debugAuthState;
}
