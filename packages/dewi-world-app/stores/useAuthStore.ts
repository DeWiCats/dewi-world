import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthStore = {
  user: User | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;

  /* Mutations */
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  registerWithEmailPassword: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      hydrated: false,
      loading: false,
      error: null,

      setUser: user => set({ user }),

      loginWithEmailPassword: async (email, password) => {
        set({ loading: true, error: null });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return set({ error: error.message, loading: false });
        set({ user: data.user, loading: false });
      },

      registerWithEmailPassword: async (email, password) => {
        set({ loading: true, error: null });
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return set({ error: error.message, loading: false });
        set({ user: data.user, loading: false });
      },

      loginWithProvider: async provider => {
        set({ loading: true, error: null });
        const { error } = await supabase.auth.signInWithOAuth({ provider });
        if (error) set({ error: error.message });
        set({ loading: false });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => state?.setState({ hydrated: true }),
    }
  )
);

/* ------------ Keep Zustand & Supabase in sync in real-time -------- */
supabase.auth.onAuthStateChange((_event, session) => {
  const user = session?.user ?? null;
  useAuthStore.getState().setUser(user);
});
