import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import ChatDetailScreen from '../chat/Conversation';
import LocationsScreen from './LocationsScreen';

const Stack = createNativeStackNavigator();

export type LocationsStackParamList = {
  Locations: undefined;
  Conversation: { conversationId: string };
};

export type LocationsStackNavigationProp = NativeStackNavigationProp<LocationsStackParamList>;

export default function LocationsNavigator() {
  const pathname = usePathname();
  useEffect(() => console.log('pathname', pathname), [pathname]);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Locations" component={LocationsScreen} />
      <Stack.Screen name="Conversation" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
}
