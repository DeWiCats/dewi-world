import CreateLocationStepper from '@/components/CreateLocationStepper';
import { darkTheme } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useStepperStore } from '@/stores/useStepperStore';
import { PortalProvider } from '@gorhom/portal';
import { ThemeProvider } from '@shopify/restyle';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StatusBar, UIManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const { hydrated, user, session } = useAuthStore();
  const { isVisible, hideStepper } = useStepperStore();

  /* -------------------------  THEME CONFIG ------------------------- */
  if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  // Load custom fonts
  const [loaded, error] = useFonts({
    TheRiola: require('@/assets/fonts/TheRiola.otf'),
  });

  // Debug auth state changes
  useEffect(() => {
    console.log('🔑 RootLayout Auth State:', {
      hydrated,
      hasUser: !!user,
      hasSession: !!session,
      hasToken: !!session?.access_token,
      userEmail: user?.email,
    });
  }, [hydrated, user, session]);

  // Add global debug functions for development
  useEffect(() => {
    if (__DEV__) {
      (global as any).checkAuth = () => {
        const state = useAuthStore.getState();
        console.log('🔍 Auth Store State:', {
          hydrated: state.hydrated,
          hasUser: !!state.user,
          hasSession: !!state.session,
          hasToken: !!state.session?.access_token,
          userEmail: state.user?.email,
          emailConfirmed: state.user?.email_confirmed_at,
          sessionExpires: state.session?.expires_at
            ? new Date(state.session.expires_at * 1000).toISOString()
            : 'N/A',
        });

        return state;
      };

      (global as any).clearAuth = () => {
        console.log('🧹 Clearing auth state...');
        useAuthStore.getState().logout();
      };

      (global as any).testPersistence = async () => {
        console.log('🧪 Testing auth persistence...');
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const { supabase } = await import('@/utils/supabase');

        // Test AsyncStorage directly
        const TEST_KEY = 'test-persistence-key';
        const TEST_VALUE = { test: 'data', timestamp: Date.now() };

        try {
          // Test AsyncStorage write/read
          await AsyncStorage.default.setItem(TEST_KEY, JSON.stringify(TEST_VALUE));
          const retrievedValue = await AsyncStorage.default.getItem(TEST_KEY);
          const parsedValue = retrievedValue ? JSON.parse(retrievedValue) : null;

          // Check auth-store persistence
          const authStoreData = await AsyncStorage.default.getItem('auth-store');
          const parsedAuthStore = authStoreData ? JSON.parse(authStoreData) : null;

          // Check current Supabase session
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          // Check Zustand store state
          const store = useAuthStore.getState();

          console.log('📊 Persistence Test Results:', {
            asyncStorageTest: {
              canWrite: !!retrievedValue,
              dataMatches: retrievedValue === JSON.stringify(TEST_VALUE),
              retrievedData: parsedValue,
            },
            authStoreInStorage: {
              exists: !!authStoreData,
              hasState: !!parsedAuthStore?.state,
              hasUser: !!parsedAuthStore?.state?.user,
              hasSession: !!parsedAuthStore?.state?.session,
              userEmail: parsedAuthStore?.state?.user?.email,
              rawData: parsedAuthStore,
            },
            supabaseSession: {
              exists: !!session,
              userEmail: session?.user?.email,
              expiresAt: session?.expires_at
                ? new Date(session.expires_at * 1000).toISOString()
                : 'N/A',
            },
            zustandStore: {
              hydrated: store.hydrated,
              hasUser: !!store.user,
              hasSession: !!store.session,
              userEmail: store.user?.email,
              expiresAt: store.session?.expires_at
                ? new Date(store.session.expires_at * 1000).toISOString()
                : 'N/A',
            },
            error: error?.message,
          });

          // Clean up test
          await AsyncStorage.default.removeItem(TEST_KEY);
        } catch (storageError) {
          console.error('❌ AsyncStorage test failed:', storageError);
        }
      };

      (global as any).forcePersistTest = async () => {
        console.log('🔄 Force persist test - manually saving and reading auth state...');
        const store = useAuthStore.getState();

        // Force trigger persistence by updating the store
        store.setAuthState(store.user, store.session);

        // Wait a moment for persistence to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if it was actually saved
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const authStoreData = await AsyncStorage.default.getItem('auth-store');

        console.log('🔍 Force persist results:', {
          storeHasData: !!(store.user && store.session),
          persistedData: authStoreData,
          parsedData: authStoreData ? JSON.parse(authStoreData) : null,
        });
      };

      console.log('🛠️ Debug functions available:');
      console.log('  checkAuth() - Check current auth state');
      console.log('  clearAuth() - Clear auth state');
      console.log('  testPersistence() - Test auth persistence');
      console.log('  forcePersistTest() - Force trigger persistence and test');
    }
  }, []);

  if (!loaded) return <></>;

  /* -------------------------  RENDER ------------------------------ */
  return (
    <ThemeProvider theme={darkTheme}>
      <PortalProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar barStyle="dark-content" />
            <Slot />

            {/* Global Stepper */}
            <CreateLocationStepper
              visible={isVisible}
              onComplete={() => {
                hideStepper();
              }}
            />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PortalProvider>
    </ThemeProvider>
  );
}
