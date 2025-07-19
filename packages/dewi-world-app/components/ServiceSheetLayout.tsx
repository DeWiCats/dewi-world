import ChatNavigator from '@/app/chat/ChatNavigator';
import LocationsNavigator from '@/app/locations/LocationsNavigator';
import RewardsNavigator from '@/app/rewards/RewardsNavigator';
import WorldNavigator from '@/app/world/WorldNavigator';
import ServiceSheetPageWrapper, { ServiceNavBarOption } from '@/components/ServiceSheetPage';
import Chat from '@assets/svgs/chat.svg';
import Coin from '@assets/svgs/coin.svg';
import Map from '@assets/svgs/map.svg';
import World from '@assets/svgs/world.svg';
import { useMemo } from 'react';

export default function ServiceSheetLayout() {
  const options = useMemo((): Array<ServiceNavBarOption> => {
    return [
      { name: 'WorldTab', Icon: World, component: WorldNavigator },
      { name: 'LocationsTab', Icon: Map, component: LocationsNavigator },
      { name: 'RewardsTab', Icon: Coin, component: RewardsNavigator },
      { name: 'ChatTab', Icon: Chat, component: ChatNavigator },
    ];
  }, []);

  return <ServiceSheetPageWrapper options={options} />;
}
