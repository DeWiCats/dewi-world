import CircleLoader from '@/components/CircleLoader';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, TextInput } from 'react-native';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { verifyEmail, resendEmailCode, loading, error, user, session, pendingEmail } =
    useAuthStore();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Redirect if no pending email or already authenticated
  useEffect(() => {
    if (!pendingEmail && !loading) {
      console.log('❌ No pending email, redirecting to registration');
      router.replace('/(auth)/CreateAccountScreen');
    } else if (user && session?.access_token) {
      console.log('✅ User verified and logged in, redirecting');
      router.replace('/(tabs)/world/WorldScreen');
    }
  }, [pendingEmail, user, session, loading, router]);

  const handleCodeChange = (value: string, index: number) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (digit && newCode.every(c => c !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');

    if (codeToVerify.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    if (!pendingEmail) {
      Alert.alert('Error', 'No email to verify');
      return;
    }

    try {
      console.log('🔢 Attempting to verify code:', codeToVerify.substring(0, 2) + '****');
      await verifyEmail(pendingEmail, codeToVerify);

      // Success handling is done in useEffect
    } catch (error) {
      console.error('❌ Verification failed:', error);
      Alert.alert('Verification Failed', error instanceof Error ? error.message : 'Unknown error');
      // Clear the code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!pendingEmail) return;

    try {
      await resendEmailCode(pendingEmail);
      setResendCooldown(30); // 30 second cooldown
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (error) {
      console.error('❌ Resend failed:', error);
      Alert.alert('Resend Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!pendingEmail) {
    return (
      <Box flex={1} backgroundColor="primaryBackground" alignItems="center" justifyContent="center">
        <CircleLoader />
        <Text variant="textMdRegular" color="secondaryText" marginTop="4">
          Loading...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="primaryBackground" padding="6" justifyContent="center">
      <Text variant="textXlBold" color="primaryText" textAlign="center" marginBottom="4">
        Verify Your Email
      </Text>

      <Text variant="textMdRegular" color="secondaryText" textAlign="center" marginBottom="2">
        We sent a 6-digit code to
      </Text>
      <Text variant="textMdSemibold" color="primaryText" textAlign="center" marginBottom="8">
        {pendingEmail}
      </Text>

      {/* Code Input Fields */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        marginBottom="6"
        paddingHorizontal="4"
      >
        {code.map((digit, index) => (
          <Box
            key={index}
            backgroundColor="inputBackground"
            borderRadius="xl"
            style={{ width: 48, height: 56 }}
            alignItems="center"
            justifyContent="center"
          >
            <TextInput
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={value => handleCodeChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: '#ffffff',
                fontFamily: 'Figtree',
                width: '100%',
                height: '100%',
              }}
              autoFocus={index === 0}
            />
          </Box>
        ))}
      </Box>

      {error && (
        <Box marginBottom="4" backgroundColor="error.500" padding="3" borderRadius="lg">
          <Text variant="textSmRegular" color="primaryBackground" textAlign="center">
            {error}
          </Text>
        </Box>
      )}

      {/* Verify Button */}
      <Pressable
        onPress={() => handleVerify()}
        disabled={loading || code.some(c => c === '')}
        style={{
          backgroundColor: loading || code.some(c => c === '') ? '#374151' : '#3b82f6',
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        {loading ? (
          <CircleLoader color="#ffffff" />
        ) : (
          <Text variant="textMdBold" color="primaryBackground">
            Verify Email
          </Text>
        )}
      </Pressable>

      {/* Resend Code */}
      <Box alignItems="center" marginBottom="4">
        {resendCooldown > 0 ? (
          <Text variant="textSmRegular" color="secondaryText">
            Resend code in {resendCooldown}s
          </Text>
        ) : (
          <Pressable onPress={handleResendCode} disabled={loading}>
            <Text variant="textSmRegular" color="blue.500">
              Didn't receive the code? Resend
            </Text>
          </Pressable>
        )}
      </Box>

      {/* Go Back */}
      <Pressable onPress={handleGoBack} style={{ alignItems: 'center' }}>
        <Text variant="textSmRegular" color="secondaryText">
          Change email address
        </Text>
      </Pressable>
    </Box>
  );
}
