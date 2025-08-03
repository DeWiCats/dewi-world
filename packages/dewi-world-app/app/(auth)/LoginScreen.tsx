import ButtonPressable from '@/components/ButtonPressable';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import TouchableContainer from '@/components/ui/TouchableContainer';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, TextInput } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithEmailPassword, loading, error, user, session, hydrated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (hydrated && user && session?.access_token) {
      router.replace('/(tabs)/world/WorldScreen');
    }
  }, [hydrated, user, session, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await loginWithEmailPassword(email, password);

      // Check if login was successful
      const state = useAuthStore.getState();
      if (state.user && state.session?.access_token) {
        router.replace('/(tabs)/world/WorldScreen');
      }
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <Box
      flex={1}
      backgroundColor="primaryBackground"
      paddingHorizontal="6"
      justifyContent={'center'}
    >
      {/* Header */}
      <Box marginTop="20" marginBottom="12" alignItems="center">
        <Text variant="riolaTitle" color="primaryText" marginBottom="2">
          Welcome Back
        </Text>
        <Text variant="textLgRegular" color="text.quaternary-500" textAlign="center">
          Sign in to continue your journey
        </Text>
      </Box>

      {/* Login Form */}
      <Box gap="6">
        {/* Email Input */}
        <Box>
          <Text variant="textMdMedium" color="primaryText" marginBottom="3">
            Email Address
          </Text>
          <Box
            backgroundColor="cardBackground"
            borderRadius="2xl"
            paddingHorizontal="4"
            paddingVertical="4"
            borderWidth={1}
            borderColor="gray.800"
          >
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
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
        </Box>

        {/* Password Input */}
        <Box>
          <Text variant="textMdMedium" color="primaryText" marginBottom="3">
            Password
          </Text>
          <Box
            backgroundColor="cardBackground"
            borderRadius="2xl"
            paddingHorizontal="4"
            paddingVertical="4"
            borderWidth={1}
            borderColor="gray.800"
          >
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={{
                fontSize: 16,
                color: '#ffffff',
                fontFamily: 'Figtree',
              }}
            />
          </Box>
        </Box>

        {/* Error Message */}
        {error && (
          <Box
            backgroundColor="error.900"
            padding="4"
            borderRadius="xl"
            borderWidth={1}
            borderColor="error.500"
          >
            <Text variant="textSmMedium" color="error.500" textAlign="center">
              {error}
            </Text>
          </Box>
        )}

        {/* Sign In Button */}
        <ButtonPressable
          onPress={handleLogin}
          disabled={loading}
          backgroundColor={loading ? 'gray.700' : 'base.white'}
          title={loading ? 'Signing In...' : 'Sign In'}
          titleColor="primaryBackground"
          fontSize={16}
          fontWeight="bold"
          marginTop="4"
        />

        {/* Create Account Link */}
        <TouchableContainer
          onPress={() => router.push('/(auth)/CreateAccountScreen')}
          alignItems="center"
          paddingVertical="4"
          marginTop="4"
          defaultBackground="primaryBackground"
          pressedBackgroundColor="gray.900"
          borderRadius={'full'}
        >
          <Text variant="textMdRegular" color="blue.500">
            Don&apos;t have an account?{' '}
            <Text variant="textMdMedium" color="blue.400">
              Sign up
            </Text>
          </Text>
        </TouchableContainer>
      </Box>
    </Box>
  );
}
