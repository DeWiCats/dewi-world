import ServiceSheetLayout from "@/components/ServiceSheetLayout";
import { darkTheme } from "@/constants/theme";
import { ThemeProvider } from "@shopify/restyle";
import { useMemo } from "react";
import { Platform, UIManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const themeObject = useMemo(() => {
    return darkTheme;
  }, []);

  if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  const colorAdaptedTheme = useMemo(
    () => ({
      ...themeObject,
    }),
    [themeObject]
  );

  return (
    <ThemeProvider theme={colorAdaptedTheme}>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          {/* <StatusBar style="auto" /> */}
          <ServiceSheetLayout />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
