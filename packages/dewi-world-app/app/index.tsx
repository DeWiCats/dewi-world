import { useAuthStore } from '@/stores/useAuthStore';
import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

export default function Index() {
  /* -------------------------  AUTH LOGIC -------------------------- */
  const user = useAuthStore(s => s.user);
  const hydrated = useAuthStore(s => s.hydrated);

  // Wait for Zustand to re-hydrate storage before making routing decisions
  if (!hydrated) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: '#fff', marginTop: 12, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  // Now we can safely check auth state after hydration
  if (user) {
    return <Redirect href="/(tabs)/world/WorldScreen" />;
  }

  return <Redirect href="/(auth)/WelcomeScreen" />;
}
