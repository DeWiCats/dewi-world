import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import RewardsScreen from "./RewardsScreen";

const Stack = createNativeStackNavigator();

export default function RewardsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Rewards" component={RewardsScreen} />
    </Stack.Navigator>
  );
}
