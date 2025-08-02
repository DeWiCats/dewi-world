import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthStore = {
  user: User | null;
  session: Session | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  pendingEmail: string | null; // Store email for verification

  /* Mutations */
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<{ needsVerification: boolean }>;
  verifyEmail: (email: string, token: string) => Promise<void>;
  resendEmailCode: (email: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setAuthState: (user: User | null, session: Session | null) => void;
  setPendingEmail: (email: string | null) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      hydrated: false,
      loading: false,
      error: null,
      pendingEmail: null,

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

      registerWithEmail: async (email, password) => {
        console.log('📧 Starting email registration for:', email);
        set({ loading: true, error: null });

        try {
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

      setUser: user => set({ user }),
      setSession: session => set({ session }),
      setAuthState: (user, session) => set({ user, session }),
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
        };
        console.log('💾 Persisting auth state:', {
          hasUser: !!persistedState.user,
          hasSession: !!persistedState.session,
          userEmail: persistedState.user?.email,
          sessionExpires: persistedState.session?.expires_at
            ? new Date(persistedState.session.expires_at * 1000).toISOString()
            : 'N/A',
        });
        return persistedState;
      },
      onRehydrateStorage: () => {
        console.log('🔄 Starting auth store rehydration...');
        return state => {
          if (state) {
            console.log('✅ Auth store rehydrated successfully:', {
              hasUser: !!state.user,
              hasSession: !!state.session,
              userEmail: state.user?.email,
              sessionExpires: state.session?.expires_at
                ? new Date(state.session.expires_at * 1000).toISOString()
                : 'N/A',
            });
            state.hydrated = true;

            // After hydration, check if the persisted session is still valid
            console.log('🔄 Checking session validity...');

            // Give Supabase some time to restore its session before validating
            setTimeout(() => {
              supabase.auth.getSession().then(({ data: { session }, error }) => {
                if (error) {
                  console.error('❌ Session check error:', error);
                  return;
                }

                const now = Math.floor(Date.now() / 1000);
                const persistedSession = state?.session;
                const isPersistedExpired = persistedSession?.expires_at
                  ? persistedSession.expires_at < now
                  : true;

                console.log('📋 Session validity check:', {
                  hasPersistedSession: !!persistedSession,
                  hasCurrentSession: !!session,
                  persistedExpiry: persistedSession?.expires_at
                    ? new Date(persistedSession.expires_at * 1000).toISOString()
                    : 'N/A',
                  currentExpiry: session?.expires_at
                    ? new Date(session.expires_at * 1000).toISOString()
                    : 'N/A',
                  isPersistedExpired,
                  currentTime: new Date().toISOString(),
                });

                // Only clear persisted session if it's actually expired
                if (persistedSession && isPersistedExpired) {
                  console.log('⚠️ Persisted session has expired, clearing auth state');
                  useAuthStore.getState().setAuthState(null, null);
                } else if (
                  session &&
                  (!persistedSession || session.expires_at !== persistedSession.expires_at)
                ) {
                  console.log('🔄 Updating auth state with current session');
                  useAuthStore.getState().setAuthState(session.user, session);
                } else if (persistedSession && !session) {
                  // Persisted session exists but Supabase doesn't have it
                  // This is normal during app startup - keep the persisted session
                  console.log('📌 Keeping persisted session, Supabase will sync later');
                }
              });
            }, 1000); // Wait 1 second for Supabase to restore session
          }
        };
      },
    }
  )
);

// Listen for auth changes and update store
supabase.auth.onAuthStateChange((_event, session) => {
  const state = useAuthStore.getState();

  console.log('🔄 Auth state changed:', {
    event: _event,
    hasUser: !!session?.user,
    hasSession: !!session,
    userEmail: session?.user?.email,
    emailConfirmed: session?.user?.email_confirmed_at,
    hydrated: state.hydrated,
  });

  // Handle different auth events appropriately
  if (state.hydrated) {
    if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
      // Always update on sign in or token refresh
      console.log('🔄 Updating auth state from auth event:', _event);
      const user = session?.user ?? null;
      state.setAuthState(user, session);
    } else if (_event === 'SIGNED_OUT') {
      // Always clear on sign out
      console.log('🚪 Clearing auth state from sign out');
      state.setAuthState(null, null);
    } else if (_event === 'INITIAL_SESSION' && session) {
      // Only update on initial session if we don't have a persisted session
      if (!state.session) {
        console.log('🔄 Setting initial session from Supabase');
        const user = session?.user ?? null;
        state.setAuthState(user, session);
      } else {
        console.log('📌 Keeping persisted session over initial session');
      }
    }
  }
});
