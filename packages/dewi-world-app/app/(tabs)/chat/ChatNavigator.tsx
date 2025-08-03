import { darkTheme } from '@/constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemeProvider } from '@shopify/restyle';
import { Stack } from 'expo-router';
import React from 'react';

export type ChatStackParamList = {
  ChatList: undefined;
  Conversation: { conversationId: string };
};

export type ChatStackNavigationProp = NativeStackNavigationProp<ChatStackParamList>;

export default function ChatNavigator() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          // cardStyle: { backgroundColor: '#000000' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="Conversation" />
      </Stack>
    </ThemeProvider>
  );
}
