import HotspotService from "@/components/Home/HotspotService";
import { darkTheme } from "@/constants/theme";
import { DarkTheme } from "@react-navigation/native";
import { ThemeProvider } from "@shopify/restyle";
import { useMemo } from "react";
import { Platform, UIManager } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Index() {
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

  const navTheme = useMemo(
    () => ({
      ...DarkTheme,
      dark: true,
      colors: {
        ...DarkTheme.colors,
        background: themeObject.colors.primaryBackground,
      },
    }),
    [themeObject]
  );

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <ThemeProvider theme={colorAdaptedTheme}>
          <HotspotService />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
