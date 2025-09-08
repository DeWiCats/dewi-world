import ButtonPressable from '@/components/ButtonPressable';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import TouchableContainer from '@/components/ui/TouchableContainer';
import { useAvoidKeyboard } from '@/hooks/useAvoidKeyboard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, TextInput } from 'react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { resetPasswordForEmail, loading, error, setError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [submitFinished, setSubmitFinished] = useState(false);
  const avoidKeyboard = useAvoidKeyboard();

  useEffect(() => {
    if (error) {
      setSubmitFinished(false);
    }
    if (!error && submitFinished) {
      Alert.alert(
        'Email sent',
        'A verification email has been sent to your address. Please check your inbox and follow the instructions.'
      );
    }
  }, [error, submitFinished]);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    try {
      await resetPasswordForEmail(email);
      setSubmitFinished(true);
    } catch (error) {
      console.error('Password reset failed:', error);
      Alert.alert(
        'Password reset failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
      setSubmitFinished(false);
    }
  };

  const returnLoginHandler = () => {
    setError(null);
    router.replace('/(auth)/LoginScreen');
  };

  return (
    <Box
      flex={1}
      backgroundColor="primaryBackground"
      paddingHorizontal="6"
      justifyContent={'center'}
    >
      <KeyboardAvoidingView
        style={{ height: '100%', justifyContent: 'center' }}
        behavior={'position'}
        enabled={avoidKeyboard}
      >
        {/* Header */}
        <Box marginTop="20" marginBottom="12" alignItems="center" gap="sm">
          <Text textAlign={'center'} variant="riolaTitle" color="primaryText" marginBottom="2">
            Forgot your password?
          </Text>
          <Text variant="textLgRegular" color="text.quaternary-500" textAlign="center">
            Reset your password and regain access to your account
          </Text>
        </Box>

        {/* Reset Password Form */}
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
            onPress={handleSubmit}
            disabled={loading}
            backgroundColor={loading ? 'gray.700' : 'base.white'}
            title={loading ? 'Please wait...' : 'Reset password'}
            titleColor="primaryBackground"
            fontSize={16}
            fontWeight="bold"
            marginTop="4"
          />

          {/* Login Screen Link */}
          <TouchableContainer
            onPress={returnLoginHandler}
            alignItems="center"
            paddingVertical="4"
            marginTop="4"
            defaultBackground="primaryBackground"
            pressedBackgroundColor="gray.900"
            borderRadius={'full'}
          >
            <Text variant="textMdMedium" color="blue.400">
              Return to login
            </Text>
          </TouchableContainer>
        </Box>
      </KeyboardAvoidingView>
    </Box>
  );
}
