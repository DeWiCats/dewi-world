import CircleLoader from '@/components/CircleLoader';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, TextInput } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithEmailPassword, loading, error, user, session, hydrated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Debug auth state
  useEffect(() => {
    console.log('🔐 LoginScreen - Auth State:', {
      hydrated,
      hasUser: !!user,
      hasSession: !!session,
      hasToken: !!session?.access_token,
      userEmail: user?.email,
    });
  }, [hydrated, user, session]);

  // Redirect if already logged in
  useEffect(() => {
    if (hydrated && user && session?.access_token) {
      console.log('✅ User already logged in, redirecting...');
      router.replace('/(tabs)/world/WorldScreen');
    }
  }, [hydrated, user, session, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      console.log('🔐 Attempting login for:', email);
      await loginWithEmailPassword(email, password);

      // Check if login was successful
      const state = useAuthStore.getState();
      console.log('🔐 Post-login state:', {
        hasUser: !!state.user,
        hasSession: !!state.session,
        hasToken: !!state.session?.access_token,
      });

      if (state.user && state.session?.access_token) {
        console.log('✅ Login successful, redirecting...');
        router.replace('/(tabs)/world/WorldScreen');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <Box flex={1} backgroundColor="primaryBackground" padding="6" justifyContent="center">
      <Text variant="textXlBold" color="primaryText" textAlign="center" marginBottom="8">
        Sign In
      </Text>

      {/* Debug info */}
      <Box marginBottom="4" backgroundColor="cardBackground" padding="3" borderRadius="lg">
        <Text variant="textXsRegular" color="secondaryText">
          Debug: {hydrated ? '✅ Hydrated' : '⏳ Loading'} | User: {user ? '✅' : '❌'} | Session:{' '}
          {session ? '✅' : '❌'} | Token: {session?.access_token ? '✅' : '❌'}
        </Text>
      </Box>

      <Box marginBottom="4">
        <Text variant="textMdRegular" color="primaryText" marginBottom="2">
          Email
        </Text>
        <Box
          backgroundColor="inputBackground"
          borderRadius="xl"
          paddingHorizontal="4"
          paddingVertical="3"
        >
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              fontSize: 16,
              color: '#ffffff',
              fontFamily: 'Figtree',
            }}
          />
        </Box>
      </Box>

      <Box marginBottom="6">
        <Text variant="textMdRegular" color="primaryText" marginBottom="2">
          Password
        </Text>
        <Box
          backgroundColor="inputBackground"
          borderRadius="xl"
          paddingHorizontal="4"
          paddingVertical="3"
        >
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry
            style={{
              fontSize: 16,
              color: '#ffffff',
              fontFamily: 'Figtree',
            }}
          />
        </Box>
      </Box>

      {error && (
        <Box marginBottom="4" backgroundColor="error.500" padding="3" borderRadius="lg">
          <Text variant="textSmRegular" color="primaryBackground" textAlign="center">
            {error}
          </Text>
        </Box>
      )}

      <Pressable
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#374151' : '#3b82f6',
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
        }}
      >
        {loading ? (
          <CircleLoader color="#ffffff" />
        ) : (
          <Text variant="textMdBold" color="primaryBackground">
            Sign In
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push('/(auth)/CreateAccountScreen')}
        style={{ marginTop: 16, alignItems: 'center' }}
      >
        <Text variant="textMdRegular" color="blue.500">
          Don't have an account? Sign up
        </Text>
      </Pressable>
    </Box>
  );
}
