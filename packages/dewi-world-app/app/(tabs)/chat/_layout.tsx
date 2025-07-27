import { darkTheme } from '@/constants/theme';
import { ThemeProvider } from '@shopify/restyle';
import { Stack } from 'expo-router';
import React from 'react';

export default function ChatLayout() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="[conversationId]" />
      </Stack>
    </ThemeProvider>
  );
}
