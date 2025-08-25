import ButtonPressable from '@/components/ButtonPressable';
import ImageUploadForm from '@/components/ImageUploadForm';
import SafeAreaBox from '@/components/SafeAreaBox';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import TouchableContainer from '@/components/ui/TouchableContainer';
import { useColors } from '@/hooks/theme';
import { pickImages } from '@/lib/imageUpload';
import { useAuthStore } from '@/stores/useAuthStore';
import ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateAccountScreen() {
  const imageLimit = 1;
  const { bottom, top } = useSafeAreaInsets();
  const router = useRouter();
  const { registerWithEmail, loading, error, user, session, hydrated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<null | ImagePicker.ImagePickerAsset>(null);
  const [uploadProgress] = useState({ completed: 0, total: 0 });
  const colors = useColors();

  const handleImagePicker = async () => {
    try {
      const result = await pickImages(imageLimit);
      if (result.success && result.images) {
        setSelectedAvatar(result.images[0]);
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = () => {
    setSelectedAvatar(null);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (hydrated && user && session?.access_token) {
      router.replace('/(tabs)/world/WorldScreen');
    }
  }, [hydrated, user, session, router]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !username || !selectedAvatar) {
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

    const avatar = `data:image/jpeg;base64,${selectedAvatar.base64}`;

    try {
      const result = await registerWithEmail(email, password, username, avatar);

      if (result.needsVerification) {
        router.push('/(auth)/VerifyEmailScreen');
      } else {
        // Registration complete - user should be logged in
        const state = useAuthStore.getState();
        if (state.user && state.session?.access_token) {
          router.replace('/(tabs)/world/WorldScreen');
        } else if (state.error) {
          Alert.alert('Registration Failed', state.error);
        }
      }
    } catch (error) {
      console.error('Registration failed:', error);
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <Box width="100%" height="100%" backgroundColor={'primaryBackground'}>
      <ScrollView
        style={{
          marginTop: top,
          marginBottom: bottom,
          backgroundColor: colors['primaryBackground'],
        }}
      >
        <SafeAreaBox flex={1} backgroundColor="primaryBackground" paddingHorizontal="6">
          {/* Header */}
          <Box marginTop="4xl" marginBottom="12" alignItems="center">
            <Text variant="riolaTitle" color="primaryText" marginBottom="2">
              Create Account
            </Text>
            <Text variant="textLgRegular" color="text.quaternary-500" textAlign="center">
              Join the adventure and start exploring
            </Text>
          </Box>

          {/* Registration Form */}
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
              <Text variant="textSmRegular" color="text.quaternary-500" marginTop="2">
                We&apos;ll send you a verification code
              </Text>
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
                  placeholder="Create a password (min 6 characters)"
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

            {/* Confirm Password Input */}
            <Box>
              <Text variant="textMdMedium" color="primaryText" marginBottom="3">
                Confirm Password
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
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
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

            {/* Username Input */}
            <Box>
              <Text variant="textMdMedium" color="primaryText" marginBottom="3">
                Username
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
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Create a username (must be unique)"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    fontSize: 16,
                    color: '#ffffff',
                    fontFamily: 'Figtree',
                  }}
                />
              </Box>
            </Box>

            {/* Avatar input */}
            <Box>
              <Text variant="textMdMedium" color="primaryText" marginBottom="3">
                Avatar
              </Text>
              <Box
                backgroundColor="cardBackground"
                borderRadius="2xl"
                paddingHorizontal="4"
                paddingVertical="4"
                borderWidth={1}
                borderColor="gray.800"
              >
                <ImageUploadForm
                  handleImagePicker={handleImagePicker}
                  removeImage={removeImage}
                  imageLimit={imageLimit}
                  isLoading={loading}
                  selectedImages={selectedAvatar ? [selectedAvatar] : []}
                  uploadProgress={uploadProgress}
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

            {/* Create Account Button */}
            <ButtonPressable
              onPress={handleRegister}
              disabled={loading}
              backgroundColor={loading ? 'gray.700' : 'base.white'}
              title={loading ? 'Creating Account...' : 'Create Account'}
              titleColor="primaryBackground"
              fontSize={16}
              fontWeight="bold"
              marginTop="4"
            />

            {/* Sign In Link */}
            <TouchableContainer
              onPress={() => router.push('/(auth)/LoginScreen')}
              alignItems="center"
              paddingVertical="4"
              marginTop="4"
              defaultBackground="primaryBackground"
              pressedBackgroundColor="gray.900"
              borderRadius={'full'}
            >
              <Text variant="textMdRegular" color="blue.500">
                Already have an account?{' '}
                <Text variant="textMdMedium" color="blue.400">
                  Sign in
                </Text>
              </Text>
            </TouchableContainer>
          </Box>
        </SafeAreaBox>
      </ScrollView>
    </Box>
  );
}
