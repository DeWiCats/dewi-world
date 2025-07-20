import { useAuthStore } from '@/stores/useAuthStore';
import { Redirect, useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  /* -------------------------  AUTH LOGIC -------------------------- */
  const { user, hydrated } = useAuthStore(s => ({
    user: s.user,
    hydrated: s.hydrated,
  }));
  // const segments = useSegments();

  //   useEffect(() => {
  //     router.replace('/(auth)/WelcomeScreen');
  //   }, [router]);

  //   // Wait for Zustand to re-hydrate storage
  //   if (!hydrated) return null; // Could render a splash screen here

  //   const inAuthGroup = segments[0] === '(auth)';

  if (user) {
    return <Redirect href="(tabs)" />;
  }

  return <Redirect href="/(auth)/WelcomeScreen" />;
}
