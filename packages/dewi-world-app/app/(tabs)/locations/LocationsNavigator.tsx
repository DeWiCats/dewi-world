import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React from 'react';
import LocationsScreen from './LocationsScreen';

const Stack = createNativeStackNavigator();

export type LocationsStackParamList = {
  Locations: undefined;
};

export type LocationsStackNavigationProp = NativeStackNavigationProp<LocationsStackParamList>;

export default function LocationsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Locations" component={LocationsScreen} />
    </Stack.Navigator>
  );
}
