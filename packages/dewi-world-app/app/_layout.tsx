import { darkTheme } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemeProvider } from '@shopify/restyle';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StatusBar, UIManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const { hydrated, user, session } = useAuthStore();

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
    console.log('🔄 RootLayout - Auth State:', {
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

      console.log('🛠️ Debug functions available:');
      console.log('  checkAuth() - Check current auth state');
      console.log('  clearAuth() - Clear auth state');
    }
  }, []);

  if (!loaded) return <></>;

  /* -------------------------  RENDER ------------------------------ */
  return (
    <ThemeProvider theme={darkTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <Slot />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
