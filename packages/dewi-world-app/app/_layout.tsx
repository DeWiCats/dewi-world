import { darkTheme } from '@/constants/theme';
import { ThemeProvider } from '@shopify/restyle';
import { Slot } from 'expo-router';
import { Platform, StatusBar, UIManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  /* -------------------------  THEME CONFIG ------------------------- */
  if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

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
