import ChatNavigator from '@/app/(tabs)/chat/ChatNavigator';
import LocationsNavigator from '@/app/(tabs)/locations/LocationsNavigator';
import ShoppingNavigator from '@/app/(tabs)/shopping/ShoppingNavigator';
import WorldNavigator from '@/app/(tabs)/world/WorldNavigator';
import ServiceSheetPageWrapper, { ServiceNavBarOption } from '@/components/ServiceSheetPage';
import Chat from '@assets/svgs/chat.svg';
import Map from '@assets/svgs/map.svg';
import StoreFront from '@assets/svgs/storefront.svg';
import World from '@assets/svgs/world.svg';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useMemo } from 'react';

export type ServiceSheetStackParamList = {
  WorldTab: undefined;
  LocationsTab: undefined;
  ChatTab: undefined;
  ShoppingTab: undefined;
};

export type ServiceSheetStackNavigationProp = BottomTabNavigationProp<ServiceSheetStackParamList>;

export default function ServiceSheetLayout({ showTabBar }: { showTabBar: boolean }) {
  const options = useMemo((): ServiceNavBarOption[] => {
    return [
      { name: 'WorldTab', Icon: World, component: WorldNavigator },
      { name: 'LocationsTab', Icon: Map, component: LocationsNavigator },
      { name: 'ChatTab', Icon: Chat, component: ChatNavigator },
      { name: 'ShoppingTab', Icon: StoreFront, component: ShoppingNavigator },
    ];
  }, []);

  return <ServiceSheetPageWrapper options={options} showTabBar={showTabBar} />;
}
