import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ShoppingScreen from './ShoppingScreen';

const Stack = createNativeStackNavigator();

export default function RewardsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Shopping" component={ShoppingScreen} />
    </Stack.Navigator>
  );
}
