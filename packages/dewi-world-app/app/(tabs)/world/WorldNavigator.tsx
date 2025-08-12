import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React from 'react';
import ChatDetailScreen from '../chat/Conversation';
import { LocationsStackParamList } from '../locations/LocationsNavigator';
import WorldScreen from './WorldScreen';

const Stack = createNativeStackNavigator();

export type WorldStackParamList = {
  World: undefined;
  Conversation: { conversationId: string };
};

export type WorldStackNavigationProp = NativeStackNavigationProp<LocationsStackParamList>;

export default function WorldNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="World" component={WorldScreen} />
      <Stack.Screen name="Conversation" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
}
