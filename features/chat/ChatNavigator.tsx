import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ChatScreen from "./ChatScreen";

const Stack = createNativeStackNavigator();

export default function ChatNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
