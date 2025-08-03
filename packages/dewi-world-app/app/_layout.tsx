import CreateLocationStepper from '@/components/CreateLocationStepper';
import SettingsBottomSheet from '@/components/SettingsBottomSheet';
import { darkTheme } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useStepperStore } from '@/stores/useStepperStore';
import { PortalProvider } from '@gorhom/portal';
import { ThemeProvider } from '@shopify/restyle';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, UIManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const { hydrated, user, session } = useAuthStore();
  const { isVisible, hideStepper } = useStepperStore();
  const { isVisible: isSettingsVisible, hideSettings } = useSettingsStore();

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
    // Auth state tracking for debugging if needed
  }, [hydrated, user, session]);

  // Add global debug functions for development
  useEffect(() => {
    if (__DEV__) {
      (global as any).checkAuth = () => {
        const state = useAuthStore.getState();
        return state;
      };

      (global as any).clearAuth = () => {
        useAuthStore.getState().logout();
      };

      (global as any).testPersistence = async () => {
        // Testing functionality available for debugging
        return useAuthStore.getState();
      };

      (global as any).forcePersistTest = async () => {
        // Force persistence testing functionality available for debugging
        const store = useAuthStore.getState();
        store.setAuthState(store.user, store.session);
        return store;
      };
    }
  }, []);

  if (!loaded) return <></>;

  /* -------------------------  RENDER ------------------------------ */
  return (
    <ThemeProvider theme={darkTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PortalProvider>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <Slot />

            {/* Global Stepper */}
            <CreateLocationStepper
              visible={isVisible}
              onComplete={() => {
                hideStepper();
              }}
            />

            {/* Global Settings Bottom Sheet */}
            <SettingsBottomSheet
              visible={isSettingsVisible}
              onClose={() => {
                hideSettings();
              }}
            />
          </SafeAreaProvider>
        </PortalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
