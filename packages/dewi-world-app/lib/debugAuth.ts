import { getAuthHeaders, isAuthenticated } from '@/lib/authHelpers';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/utils/supabase';

/**
 * Comprehensive auth debugging utility
 */
export async function debugAuthFlow() {
  console.log('\n🔍 === COMPREHENSIVE AUTH DEBUG ===');

  // 1. Check Zustand store state
  console.log('\n1️⃣ Zustand Store State:');
  const storeState = useAuthStore.getState();
  console.log('Store hydrated:', storeState.hydrated);
  console.log(
    'Store user:',
    storeState.user
      ? {
          id: storeState.user.id,
          email: storeState.user.email,
        }
      : null
  );
  console.log(
    'Store session:',
    storeState.session
      ? {
          has_access_token: !!storeState.session.access_token,
          token_preview: storeState.session.access_token?.substring(0, 30) + '...',
          expires_at: storeState.session.expires_at,
          expires_in_hours: storeState.session.expires_at
            ? ((storeState.session.expires_at * 1000 - Date.now()) / (1000 * 60 * 60)).toFixed(1)
            : 'N/A',
        }
      : null
  );

  // 2. Check live Supabase session
  console.log('\n2️⃣ Live Supabase Session:');
  try {
    const {
      data: { session: liveSession },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase session error:', error);
    } else {
      console.log(
        'Live session:',
        liveSession
          ? {
              user_id: liveSession.user.id,
              user_email: liveSession.user.email,
              has_access_token: !!liveSession.access_token,
              token_preview: liveSession.access_token?.substring(0, 30) + '...',
              expires_at: liveSession.expires_at,
              expires_in_hours: liveSession.expires_at
                ? ((liveSession.expires_at * 1000 - Date.now()) / (1000 * 60 * 60)).toFixed(1)
                : 'N/A',
            }
          : null
      );

      console.log(
        'Store vs Live match:',
        storeState.session?.access_token === liveSession?.access_token
      );
    }
  } catch (err) {
    console.error('Error getting live session:', err);
  }

  // 3. Test auth helpers
  console.log('\n3️⃣ Auth Helpers Test:');
  try {
    const authenticated = isAuthenticated();
    console.log('isAuthenticated():', authenticated);

    const headers = getAuthHeaders();
    console.log('getAuthHeaders() success:', !!headers.Authorization);
    console.log('Headers token preview:', headers.Authorization.substring(0, 40) + '...');
  } catch (error) {
    console.error('Auth helpers error:', error instanceof Error ? error.message : error);
  }

  // 4. Test API call
  console.log('\n4️⃣ API Call Test:');
  try {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3006';
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/v1/messaging/conversations?limit=1`, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('API Response success:', data.success);
    } else {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
    }
  } catch (error) {
    console.error('API call failed:', error instanceof Error ? error.message : error);
  }

  // 5. Store persistence check
  console.log('\n5️⃣ Store Persistence Check:');
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const persistedData = await AsyncStorage.getItem('auth-store');
    console.log('Persisted auth data exists:', !!persistedData);
    if (persistedData) {
      const parsed = JSON.parse(persistedData);
      console.log('Persisted data keys:', Object.keys(parsed.state || {}));
      console.log('Persisted user exists:', !!parsed.state?.user);
      console.log('Persisted session exists:', !!parsed.state?.session);
    }
  } catch (error) {
    console.error('Error checking persistence:', error);
  }

  console.log('\n✅ Debug complete!\n');
}

/**
 * Quick auth status check
 */
export function quickAuthCheck() {
  const { user, session, hydrated } = useAuthStore.getState();
  console.log('🔍 Quick Auth Check:', {
    hydrated,
    hasUser: !!user,
    hasSession: !!session,
    hasToken: !!session?.access_token,
    authenticated: isAuthenticated(),
  });
}

// Export for dev console
if (__DEV__) {
  (global as any).debugAuthFlow = debugAuthFlow;
  (global as any).quickAuthCheck = quickAuthCheck;
}
