import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React from 'react';
import LocationsScreen from './LocationsScreen';
import CreateLocationScreen from './create';

const Stack = createNativeStackNavigator();

export type LocationsStackParamList = {
  Locations: undefined;
  create: undefined;
};

export type LocationsStackNavigationProp = NativeStackNavigationProp<LocationsStackParamList>;

export default function LocationsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Locations" component={LocationsScreen} />
      <Stack.Screen name="create" component={CreateLocationScreen} />
    </Stack.Navigator>
  );
}
