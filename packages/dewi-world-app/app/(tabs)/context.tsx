import ServiceSheetLayout from '@/components/ServiceSheetLayout';
import TabsHeader from '@/components/TabsHeader';
import { useSpacing } from '@/hooks/theme';
import { createContext, useCallback, useState } from 'react';

interface TabsContextValue {
  hideHeader: () => void;
  showHeader: () => void;
  hideTabBar: () => void;
  showTabBar: () => void;
}

export const TabsContext = createContext<TabsContextValue>(null as any);

export const TabsContextProvider = () => {
  const spacing = useSpacing();
  const [showHeader, setShowHeader] = useState(true);
  const [showTabBar, setShowTabBar] = useState(true);

  const onShowHeader = useCallback(() => setShowHeader(true), []);
  const onHideHeader = useCallback(() => setShowHeader(false), []);

  const onShowTabBar = useCallback(() => setShowTabBar(true), []);
  const onHideTabBar = useCallback(() => setShowTabBar(false), []);

  const value = {
    showHeader: onShowHeader,
    hideHeader: onHideHeader,
    showTabBar: onShowTabBar,
    hideTabBar: onHideTabBar,
  };

  return (
    <TabsContext.Provider value={value}>
      {showHeader && (
        <TabsHeader position="absolute" top={spacing['4xl']} left={0} right={0} zIndex={1000} />
      )}
      <ServiceSheetLayout showTabBar={showTabBar} />
    </TabsContext.Provider>
  );
};
