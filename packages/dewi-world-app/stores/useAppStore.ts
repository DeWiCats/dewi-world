import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AppStore = {
  mockMode: boolean;
  setMockMode: (mockMode: boolean) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    set => ({
      mockMode: false, // Default to mock mode for development
      setMockMode: mockMode => set({ mockMode }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
