import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import ServiceSheetPage, {
  ServiceNavBarOption,
} from "@/components/ServiceSheetPage";
import ChatNavigator from "@/features/chat/ChatNavigator";
import LocationsNavigator from "@/features/locations/LocationsNavigator";
import RewardsNavigator from "@/features/rewards/RewardsNavigator";
import WorldNavigator from "@/features/world/WorldNavigator";
import Chat from "@assets/svgs/chat.svg";
import Coin from "@assets/svgs/coin.svg";
import Map from "@assets/svgs/map.svg";
import World from "@assets/svgs/world.svg";
import { darkTheme } from "@config/theme/theme";
import { useMemo } from "react";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={darkTheme as any}>
      {/* <ServiceSheetLayout /> */}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const ServiceSheetLayout = () => {
  const options = useMemo((): Array<ServiceNavBarOption> => {
    return [
      { name: "World", Icon: World, component: WorldNavigator },
      { name: "Locations", Icon: Map, component: LocationsNavigator },
      { name: "Rewards", Icon: Coin, component: RewardsNavigator },
      { name: "Chat", Icon: Chat, component: ChatNavigator },
    ];
  }, []);

  return <ServiceSheetPage options={options} />;
};
