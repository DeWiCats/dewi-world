import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React from 'react';
import ChatDetailScreen from './[conversationId]';
import ChatListScreen from './index';

export type ChatStackParamList = {
  ChatList: undefined;
  ChatDetail: undefined;
};

export type ChatStackNavigationProp = NativeStackNavigationProp<ChatStackParamList>;

const Stack = createNativeStackNavigator();

export default function ChatNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // cardStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
}
