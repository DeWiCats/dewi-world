import ChatNavigator from '@/app/(tabs)/chat/ChatNavigator';
import LocationsNavigator from '@/app/(tabs)/locations/LocationsNavigator';
import RewardsNavigator from '@/app/(tabs)/rewards/RewardsNavigator';
import WorldNavigator from '@/app/(tabs)/world/WorldNavigator';
import ServiceSheetPageWrapper, { ServiceNavBarOption } from '@/components/ServiceSheetPage';
import Chat from '@assets/svgs/chat.svg';
import Coin from '@assets/svgs/coin.svg';
import Map from '@assets/svgs/map.svg';
import World from '@assets/svgs/world.svg';
import { useMemo } from 'react';

export default function ServiceSheetLayout({ showTabBar }: { showTabBar: boolean }) {
  const options = useMemo((): ServiceNavBarOption[] => {
    return [
      { name: 'WorldTab', Icon: World, component: WorldNavigator },
      { name: 'LocationsTab', Icon: Map, component: LocationsNavigator },
      { name: 'ChatTab', Icon: Chat, component: ChatNavigator },
      { name: 'RewardsTab', Icon: Coin, component: RewardsNavigator },
    ];
  }, []);

  return <ServiceSheetPageWrapper options={options} showTabBar={showTabBar} />;
}
