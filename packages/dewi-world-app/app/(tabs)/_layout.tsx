import { darkTheme } from '@/constants/theme';
import { ThemeProvider } from '@shopify/restyle';
import React from 'react';
import { TabsContextProvider } from './context';

export default function TabsLayout() {
  return (
    <ThemeProvider theme={darkTheme}>
      <TabsContextProvider />
    </ThemeProvider>
  );
}
