import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import LocationsScreen from "./LocationsScreen";

const Stack = createNativeStackNavigator();

export default function LocationsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Locations" component={LocationsScreen} />
    </Stack.Navigator>
  );
}
