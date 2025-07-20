import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import WorldScreen from "./WorldScreen";

const Stack = createNativeStackNavigator();

export default function WorldNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="World" component={WorldScreen} />
    </Stack.Navigator>
  );
}
