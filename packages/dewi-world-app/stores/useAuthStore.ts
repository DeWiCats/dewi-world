import { Profile, UsersAPI } from '@/lib/usersAPI';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthStore = {
  profile: Profile | null;
  user: User | null;
  session: Session | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  pendingEmail: string | null; // Store email for verification
  _isInternalUpdate: boolean; // Internal flag to prevent infinite loops

  /* Mutations */
  getProfileById: (user_id: string) => Promise<null | Profile>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    username: string,
    avatar: string
  ) => Promise<{ needsVerification: boolean }>;
  verifyEmail: (email: string, token: string) => Promise<void>;
  resendEmailCode: (email: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  deleteAcc: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setAuthState: (user: User | null, session: Session | null) => void;
  setPendingEmail: (email: string | null) => void;
};

const api = new UsersAPI();

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      profile: null,
      user: null,
      session: null,
      hydrated: false,
      loading: false,
      error: null,
      pendingEmail: null,
      _isInternalUpdate: false,
      getProfileById: async (user_id: string) => await api.getUserProfile({ user_id }),
      loginWithEmailPassword: async (email, password) => {
        console.log('🔐 Starting email login process for:', email);
        set({ loading: true, error: null });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          });

          console.log('🔐 Supabase login response:', {
            hasUser: !!data.user,
            hasSession: !!data.session,
            userEmail: data.user?.email,
            userEmailConfirmed: data.user?.email_confirmed_at,
            error: error?.message,
            errorCode: error?.status,
          });

          if (error) {
            console.error('❌ Login error:', {
              message: error.message,
              status: error.status,
              details: error,
            });

            // Handle specific error types
            if (error.message.includes('Invalid login credentials')) {
              set({
                error: 'Invalid email or password. Please check your credentials and try again.',
                loading: false,
              });
            } else if (error.message.includes('Email not confirmed')) {
              set({
                error:
                  'Please verify your email first. Check your inbox for the verification code.',
                loading: false,
              });
            } else if (error.message.includes('Too many requests')) {
              set({
                error: 'Too many login attempts. Please wait a moment and try again.',
                loading: false,
              });
            } else {
              set({
                error: `Login failed: ${error.message}`,
                loading: false,
              });
            }
            return;
          }

          if (!data.user || !data.session) {
            console.error('❌ Login succeeded but missing user or session data');
            set({
              error: 'Login failed: Missing user data. Please try again.',
              loading: false,
            });
            return;
          }

          console.log('✅ Login successful:', {
            userId: data.user.id,
            email: data.user.email,
            emailConfirmed: data.user.email_confirmed_at,
            sessionExpires: data.session.expires_at,
          });

          set({
            profile: await get().getProfileById(data.user.id),
            user: data.user,
            session: data.session,
            loading: false,
            error: null,
            pendingEmail: null,
          });
        } catch (err) {
          console.error('❌ Login exception:', err);
          const errorMessage = err instanceof Error ? err.message : 'Unknown login error';
          set({ error: errorMessage, loading: false });
        }
      },

      registerWithEmail: async (email, password, username, avatar) => {
        console.log('📧 Starting email registration for:', email);
        set({ loading: true, error: null });

        try {
          // Check if username alredy exists
          const existingUser = await api.getUserProfile({ username });

          if (existingUser) {
            set({
              error: 'This username is already taken. Please choose another one.',
              loading: false,
            });
            return { needsVerification: false };
          }

          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
            options: {
              emailRedirectTo: undefined, // Don't use email links, use OTP codes instead
            },
          });

          console.log('📧 Email registration response:', {
            hasUser: !!data.user,
            hasSession: !!data.session,
            userEmail: data.user?.email,
            emailConfirmed: data.user?.email_confirmed_at,
            needsConfirmation: !data.session && data.user && !data.user.email_confirmed_at,
            error: error?.message,
          });

          if (error) {
            console.error('❌ Email registration error:', error);

            if (error.message.includes('already registered')) {
              set({
                error: 'This email is already registered. Please try signing in instead.',
                loading: false,
              });
            } else if (error.message.includes('Password should be')) {
              set({
                error: 'Password must be at least 6 characters long.',
                loading: false,
              });
            } else if (error.message.includes('Invalid email')) {
              set({
                error: 'Please enter a valid email address.',
                loading: false,
              });
            } else {
              set({
                error: `Registration failed: ${error.message}`,
                loading: false,
              });
            }
            return { needsVerification: false };
          }

          let profile: Profile | null = null;

          // Create new profile entry
          if (data.user) {
            profile = await api.createUserProfile({
              user_id: data.user.id,
              avatar,
              username,
            });

            console.log('📧 Profile registration response:', profile);
          }

          // Check if email verification is needed
          if (data.user && !data.session) {
            console.log('📧 Email verification required');
            set({
              pendingEmail: email.trim(),
              loading: false,
              error: null,
            });
            return { needsVerification: true };
          }

          // If we get a session immediately, registration is complete
          if (data.user && data.session) {
            console.log('✅ Registration successful with immediate session');
            set({
              profile: profile,
              user: data.user,
              session: data.session,
              loading: false,
              error: null,
              pendingEmail: null,
            });
            return { needsVerification: false };
          }

          // Fallback - assume verification needed
          set({
            pendingEmail: email.trim(),
            loading: false,
            error: null,
          });
          return { needsVerification: true };
        } catch (err) {
          console.error('❌ Email registration exception:', err);
          const errorMessage = err instanceof Error ? err.message : 'Unknown registration error';
          set({ error: errorMessage, loading: false });
          return { needsVerification: false };
        }
      },

      verifyEmail: async (email, token) => {
        console.log('🔢 Verifying email with code:', {
          email,
          token: token.substring(0, 2) + '****',
        });
        set({ loading: true, error: null });

        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: token.trim(),
            type: 'signup',
          });

          console.log('🔢 Email verification response:', {
            hasUser: !!data.user,
            hasSession: !!data.session,
            userEmail: data.user?.email,
            emailConfirmed: data.user?.email_confirmed_at,
            error: error?.message,
          });

          if (error) {
            console.error('❌ Email verification error:', error);

            if (error.message.includes('expired')) {
              set({
                error: 'Verification code has expired. Please request a new one.',
                loading: false,
              });
            } else if (error.message.includes('invalid')) {
              set({
                error: 'Invalid verification code. Please check and try again.',
                loading: false,
              });
            } else {
              set({
                error: `Verification failed: ${error.message}`,
                loading: false,
              });
            }
            return;
          }

          if (data.user && data.session) {
            console.log('✅ Email verification successful');
            set({
              profile: await get().getProfileById(data.user.id),
              user: data.user,
              session: data.session,
              loading: false,
              error: null,
              pendingEmail: null,
            });
          }
        } catch (err) {
          console.error('❌ Email verification exception:', err);
          const errorMessage = err instanceof Error ? err.message : 'Unknown verification error';
          set({ error: errorMessage, loading: false });
        }
      },

      resendEmailCode: async email => {
        console.log('🔄 Resending verification code to:', email);
        set({ loading: true, error: null });

        try {
          console.log('🔄 Resending verification code to:', email.trim());
          const { error } = await supabase.auth.resend({
            email: email.trim(),
            type: 'signup',
          });

          if (error) {
            console.error('❌ Resend code error:', error);
            set({
              error: `Failed to resend code: ${error.message}`,
              loading: false,
            });
          } else {
            console.log('✅ Verification code resent');
            set({
              loading: false,
              error: null,
            });
          }
        } catch (err) {
          console.error('❌ Resend code exception:', err);
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          set({ error: errorMessage, loading: false });
        }
      },

      loginWithProvider: async provider => {
        set({ loading: true, error: null });
        const { error } = await supabase.auth.signInWithOAuth({ provider });
        if (error) {
          console.error('OAuth error:', error);
          set({ error: error.message, loading: false });
        }
      },

      logout: async () => {
        console.log('🚪 Logging out user');
        await supabase.auth.signOut();
        set({ user: null, session: null, error: null, pendingEmail: null });
      },

      deleteAcc: async () => {
        try {
          console.log('🚪 Deleting user');
          const user = get().user;
          if (!user) return;

          const data = await api.deleteCurrentUser();

          console.log('User deleted successfully:', data);
          set({ user: null, session: null, error: null, pendingEmail: null });
        } catch (error) {
          console.error('Error deleting user', error);
        }
      },
      setProfile: profile => set({ profile }),
      setUser: user => set({ user }),
      setSession: session => set({ session }),
      setAuthState: (user, session) => {
        const currentState = get();

        // Prevent infinite loops from Supabase auth listener callbacks
        if (currentState._isInternalUpdate) {
          return;
        }

        set({ user, session, _isInternalUpdate: true });

        // Sync session to Supabase client for storage operations
        if (session) {
          supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
        } else {
          supabase.auth.signOut();
        }
        /*
         * @Peronif5 This block of code triggers the render loop hell
         *
         *  // Reset the flag after a brief delay
         *  setTimeout(() => {
         *    set({ _isInternalUpdate: false });
         *  }, 100);
         */
      },
      setPendingEmail: email => set({ pendingEmail: email }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => {
        const persistedState = {
          user: state.user,
          session: state.session,
          pendingEmail: state.pendingEmail,
          // Exclude _isInternalUpdate from persistence
        };
        return persistedState;
      },
      onRehydrateStorage: () => {
        return state => {
          if (state) {
            state.hydrated = true;
            state._isInternalUpdate = false; // Reset internal flag on hydration

            // CRITICAL: Restore session to Supabase client for storage operations
            if (state.session) {
              supabase.auth.setSession({
                access_token: state.session.access_token,
                refresh_token: state.session.refresh_token,
              });
            }

            // After hydration, check if the persisted session is still valid
            setTimeout(() => {
              supabase.auth.getSession().then(({ data: { session }, error }) => {
                if (error) {
                  return;
                }

                const now = Math.floor(Date.now() / 1000);
                const persistedSession = state?.session;
                const isPersistedExpired = persistedSession?.expires_at
                  ? persistedSession.expires_at < now
                  : true;

                // Only clear persisted session if it's actually expired
                if (persistedSession && isPersistedExpired) {
                  useAuthStore.getState().setAuthState(null, null);
                } else if (
                  session &&
                  (!persistedSession || session.expires_at !== persistedSession.expires_at)
                ) {
                  useAuthStore.getState().setAuthState(session.user, session);
                }
                // If persisted session exists but Supabase doesn't have it,
                // this is normal during app startup - keep the persisted session
              });
            }, 1000); // Wait 1 second for Supabase to restore session
          }
        };
      },
    }
  )
);

// Listen for auth changes and update store
supabase.auth.onAuthStateChange(async (_event, session) => {
  const state = useAuthStore.getState();

  // Handle different auth events appropriately
  if (state.hydrated) {
    if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
      // Always update on sign in or token refresh
      const user = session?.user ?? null;
      const profile = state.profile;

      if (user && !profile) {
        console.log('set profile on sign in and token refresh');
        state.setProfile(await state.getProfileById(user.id));
      }
      state.setAuthState(user, session);
    } else if (_event === 'SIGNED_OUT') {
      // Always clear on sign out
      state.setAuthState(null, null);
    } else if (_event === 'INITIAL_SESSION' && session) {
      // Only update on initial session if we don't have a persisted session
      if (!state.session) {
        const user = session?.user ?? null;
        const profile = state.profile;

        if (user && !profile) {
          console.log('set profile on initial session');
          const profile = await state.getProfileById(user.id);
          console.log('fetched profile is', profile);
          state.setProfile(profile);
        }
        state.setAuthState(user, session);
      }
    }
  }
});
