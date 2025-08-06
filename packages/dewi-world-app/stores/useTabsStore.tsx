import { create } from 'zustand';

interface TabsStore {
  tabBarVisible: boolean;
  headerVisible: boolean;
  showHeader: () => void;
  showTabBar: () => void;
  hideHeader: () => void;
  hideTabBar: () => void;
}

export const useTabsStore = create<TabsStore>(set => ({
  tabBarVisible: true,
  headerVisible: true,
  showHeader: () => set({ headerVisible: true }),
  showTabBar: () => set({ tabBarVisible: true }),
  hideHeader: () => set({ headerVisible: false }),
  hideTabBar: () => set({ tabBarVisible: false }),
}));
