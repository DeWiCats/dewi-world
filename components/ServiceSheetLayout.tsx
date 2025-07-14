import ServiceSheetPageWrapper, {
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
import { useMemo } from "react";

export default function ServiceSheetLayout() {
  const options = useMemo((): Array<ServiceNavBarOption> => {
    return [
      { name: "WorldTab", Icon: World, component: WorldNavigator },
      { name: "LocationsTab", Icon: Map, component: LocationsNavigator },
      { name: "RewardsTab", Icon: Coin, component: RewardsNavigator },
      { name: "ChatTab", Icon: Chat, component: ChatNavigator },
    ];
  }, []);

  return <ServiceSheetPageWrapper options={options} />;
}
