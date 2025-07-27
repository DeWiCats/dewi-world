import CircleLoader from '@/components/CircleLoader';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, TextInput } from 'react-native';

export default function CreateAccountScreen() {
  const router = useRouter();
  const { registerWithEmail, loading, error, user, session, hydrated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Debug auth state
  useEffect(() => {
    console.log('📝 CreateAccountScreen - Auth State:', {
      hydrated,
      hasUser: !!user,
      hasSession: !!session,
      hasToken: !!session?.access_token,
      userEmail: user?.email,
      emailConfirmed: user?.email_confirmed_at,
    });
  }, [hydrated, user, session]);

  // Redirect if already logged in
  useEffect(() => {
    if (hydrated && user && session?.access_token) {
      console.log('✅ User already logged in, redirecting...');
      router.replace('/(tabs)/world/WorldScreen');
    }
  }, [hydrated, user, session, router]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      console.log('📝 Attempting email registration for:', email);

      const result = await registerWithEmail(email, password);

      if (result.needsVerification) {
        console.log('📧 Registration successful, navigating to verification');
        router.push('/(auth)/VerifyEmailScreen');
      } else {
        // Registration complete - user should be logged in
        const state = useAuthStore.getState();
        if (state.user && state.session?.access_token) {
          console.log('✅ Registration complete, redirecting to app');
          router.replace('/(tabs)/world/WorldScreen');
        } else if (state.error) {
          Alert.alert('Registration Failed', state.error);
        }
      }
    } catch (error) {
      console.error('❌ Registration failed:', error);
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <Box flex={1} backgroundColor="primaryBackground" padding="6" justifyContent="center">
      <Text variant="textXlBold" color="primaryText" textAlign="center" marginBottom="8">
        Create Account
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
          Email Address
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
            autoCorrect={false}
            style={{
              fontSize: 16,
              color: '#ffffff',
              fontFamily: 'Figtree',
            }}
          />
        </Box>
        <Text variant="textXsRegular" color="secondaryText" marginTop="1">
          We'll send you a 6-digit verification code
        </Text>
      </Box>

      <Box marginBottom="4">
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
            placeholder="Enter your password (min 6 characters)"
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

      <Box marginBottom="6">
        <Text variant="textMdRegular" color="primaryText" marginBottom="2">
          Confirm Password
        </Text>
        <Box
          backgroundColor="inputBackground"
          borderRadius="xl"
          paddingHorizontal="4"
          paddingVertical="3"
        >
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
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
        onPress={handleRegister}
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
            Send Verification Code
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push('/(auth)/LoginScreen')}
        style={{ marginTop: 16, alignItems: 'center' }}
      >
        <Text variant="textMdRegular" color="blue.500">
          Already have an account? Sign in
        </Text>
      </Pressable>
    </Box>
  );
}
