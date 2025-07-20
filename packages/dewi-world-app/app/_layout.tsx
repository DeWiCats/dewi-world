import ServiceSheetLayout from '@/components/ServiceSheetLayout';
import { darkTheme } from '@/constants/theme';
import { ThemeProvider } from '@shopify/restyle';
import { useMemo } from 'react';
import { Platform, StatusBar, UIManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/useAuthStore';
import { Redirect, Slot, useSegments } from 'expo-router';

export default function RootLayout() {
  /* -------------------------  THEME CONFIG ------------------------- */
  const themeObject = useMemo(() => darkTheme, []);

  if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  const colorAdaptedTheme = useMemo(() => ({ ...themeObject }), [themeObject]);

  /* -------------------------  AUTH LOGIC -------------------------- */
  const { user, hydrated } = useAuthStore(s => ({
    user: s.user,
    hydrated: s.hydrated,
  }));
  const segments = useSegments();

  // Wait for Zustand to re-hydrate storage
  if (!hydrated) return null; // Could render a splash screen here

  const inAuthGroup = segments[0] === '(auth)';

  /* -------------------------  RENDER ------------------------------ */
  return (
    <ThemeProvider theme={colorAdaptedTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          {user ? (
            /* Signed-in users go straight to the protected app */
            <ServiceSheetLayout />
          ) : inAuthGroup ? (
            /* We’re inside the (auth) stack, so render its screens */
            <Slot />
          ) : (
            /* Not authenticated and outside auth stack: send to welcome */
            <Redirect href="/(auth)/welcome" />
          )}
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
