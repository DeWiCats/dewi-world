import { create } from 'zustand';

interface SettingsStore {
  isVisible: boolean;
  showSettings: () => void;
  hideSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>(set => ({
  isVisible: false,
  showSettings: () => set({ isVisible: true }),
  hideSettings: () => set({ isVisible: false }),
}));
