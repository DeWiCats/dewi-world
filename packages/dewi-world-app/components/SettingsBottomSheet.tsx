import CustomBottomSheet from '@/components/CustomBottomSheet';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import TouchableContainer from '@/components/ui/TouchableContainer';
import { useColors } from '@/hooks/theme';
import { pickImages } from '@/lib/imageUpload';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import ButtonPressable from './ButtonPressable';
import ImageUploadForm from './ImageUploadForm';
import TextInput from './ui/TextInput';

interface SettingsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsBottomSheet({ visible, onClose }: SettingsBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { logout, deleteAcc, updateCurrentProfile, loading, error, user } = useAuthStore();
  const { hideSettings, isVisible } = useSettingsStore();
  const router = useRouter();
  // Animation values
  const [currentStep, setCurrentStep] = useState(0);
  const slideX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  const [submitFinished, setSubmitFinished] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<null | ImagePicker.ImagePickerAsset>(null);
  const [username, setUsername] = useState('');
  const [uploadProgress] = useState({ completed: 0, total: 0 });
  const imageLimit = 1;
  const colors = useColors();
  const canSubmit = useMemo(() => !!selectedAvatar || !!username, [selectedAvatar, username]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isVisible) {
        slideX.set(0);
        setCurrentStep(0);
        setUsername('');
        setSelectedAvatar(null);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [isVisible]);

  const handleImagePicker = async () => {
    try {
      const result = await pickImages(imageLimit);
      if (result.success && result.images) {
        setSelectedAvatar(result.images[0]);
      } else if (result.error && result.error !== 'Image selection was cancelled') {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = () => {
    setSelectedAvatar(null);
  };

  const nextStep = () => {
    if (currentStep < 1) {
      const nextStepIndex = currentStep + 1;
      slideX.value = withTiming(-100, { duration: 300 }, finished => {
        if (finished) {
          runOnJS(setCurrentStep)(nextStepIndex);
          slideX.value = 100;
          slideX.value = withSpring(0, { damping: 20, stiffness: 200 });
        }
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      slideX.value = withTiming(100, { duration: 300 }, finished => {
        if (finished) {
          runOnJS(setCurrentStep)(prevStepIndex);
          slideX.value = -100;
          slideX.value = withSpring(0, { damping: 20, stiffness: 200 });
        }
      });
    }
  };

  const editProfileHandler = async () => {
    if (!canSubmit) return;

    await updateCurrentProfile({
      username,
      avatar: `data:image/jpeg;base64,${selectedAvatar?.base64}`,
    });
    setSubmitFinished(true);
  };

  useEffect(() => {
    if (error) {
      setSubmitFinished(false)
      return
    }
    if (!error && submitFinished) {
      Alert.alert("Success", "Your profile has been successfully updated!")
    }
  }, [submitFinished, error])

  const renderContent = useCallback(() => {
    switch (currentStep) {
      case 0:
        return (
          <Box flex={1} width="100%" paddingHorizontal="6" paddingTop="4">
            {/* Header */}
            <Box marginBottom="6">
              <Text variant="displaySmSemibold" color="primaryText" marginBottom="2">
                Settings
              </Text>
              <Text variant="textSmRegular" color="text.quaternary-500">
                Version 1.0.0
              </Text>
            </Box>

            {/* Settings Items */}
            <Box gap="4">
              {/* Edit profile */}
              <TouchableContainer
                onPress={nextStep}
                backgroundColor="transparent"
                paddingVertical="4"
                paddingHorizontal="4"
                borderRadius="2xl"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box flexDirection="row" alignItems="center">
                  <Box
                    width={40}
                    height={40}
                    borderRadius="full"
                    backgroundColor="gray.800"
                    justifyContent="center"
                    alignItems="center"
                    marginRight="4"
                  >
                    <Text fontSize={18}>🔒</Text>
                  </Box>
                  <Box>
                    <Text variant="textMdMedium" color="primaryText">
                      Edit profile
                    </Text>
                    <Text variant="textSmRegular" color="text.quaternary-500">
                      Edit your profile info
                    </Text>
                  </Box>
                </Box>
                <Text color="gray.500" fontSize={16}>
                  →
                </Text>
              </TouchableContainer>

              {/* Privacy Policy */}
              <TouchableContainer
                onPress={handlePrivacyPolicy}
                backgroundColor="transparent"
                paddingVertical="4"
                paddingHorizontal="4"
                borderRadius="2xl"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box flexDirection="row" alignItems="center">
                  <Box
                    width={40}
                    height={40}
                    borderRadius="full"
                    backgroundColor="gray.800"
                    justifyContent="center"
                    alignItems="center"
                    marginRight="4"
                  >
                    <Text fontSize={18}>🔒</Text>
                  </Box>
                  <Box>
                    <Text variant="textMdMedium" color="primaryText">
                      Privacy Policy
                    </Text>
                    <Text variant="textSmRegular" color="text.quaternary-500">
                      View our privacy policy
                    </Text>
                  </Box>
                </Box>
                <Text color="gray.500" fontSize={16}>
                  →
                </Text>
              </TouchableContainer>

              {/* Logout */}
              <TouchableContainer
                onPress={handleLogout}
                backgroundColor="transparent"
                paddingVertical="4"
                paddingHorizontal="4"
                borderRadius="2xl"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box flexDirection="row" alignItems="center">
                  <Box
                    width={40}
                    height={40}
                    borderRadius="full"
                    backgroundColor="error.900"
                    justifyContent="center"
                    alignItems="center"
                    marginRight="4"
                  >
                    <Text fontSize={18}>🚪</Text>
                  </Box>
                  <Box>
                    <Text variant="textMdMedium" color="error.500">
                      Log Out
                    </Text>
                    <Text variant="textSmRegular" color="text.quaternary-500">
                      Sign out of your account
                    </Text>
                  </Box>
                </Box>
                <Text color="gray.500" fontSize={16}>
                  →
                </Text>
              </TouchableContainer>
              {/* Delete account */}
              <TouchableContainer
                onPress={handleDelete}
                backgroundColor="transparent"
                paddingVertical="4"
                paddingHorizontal="4"
                borderRadius="2xl"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box flexDirection="row" alignItems="center">
                  <Box
                    width={40}
                    height={40}
                    borderRadius="full"
                    backgroundColor="error.900"
                    justifyContent="center"
                    alignItems="center"
                    marginRight="4"
                  >
                    <Text fontSize={18}>❌</Text>
                  </Box>
                  <Box>
                    <Text variant="textMdMedium" color="error.500">
                      Delete account
                    </Text>
                    <Text variant="textSmRegular" color="text.quaternary-500">
                      Delete your account permanently
                    </Text>
                  </Box>
                </Box>
                <Text color="gray.500" fontSize={16}>
                  →
                </Text>
              </TouchableContainer>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box flex={1} width="100%" paddingHorizontal="6" paddingTop="4">
            <Box width="100%" alignItems={'center'} marginBottom="xl">
              <ButtonPressable
                disabled={loading}
                width={100}
                height={40}
                backgroundColor={'base.white'}
                titleColor="base.black"
                title="Back"
                fontSize={14}
                fontWeight="bold"
                onPress={prevStep}
              />
            </Box>
            <Text textAlign={'center'} variant="riolaTitle" color="primaryText" marginBottom="2">
              Update your profile
            </Text>
            <Text>Update profile picture</Text>
            <ImageUploadForm
              handleImagePicker={handleImagePicker}
              removeImage={removeImage}
              imageLimit={imageLimit}
              isLoading={loading}
              selectedImages={selectedAvatar ? [selectedAvatar] : []}
              uploadProgress={uploadProgress}
            />
            <Text>Update username</Text>
            <TextInput
              fontSize={16}
              fontWeight="bold"
              textColor="activeBackground"
              textInputProps={{
                onChangeText: setUsername,
                value: username,
                placeholder: 'Enter new username',
                placeholderTextColor: colors['gray.500'],
                autoCorrect: false,
                selectionColor: colors['gray.500'],
                autoComplete: 'off',
              }}
              backgroundColor="fg.quinary-400"
            />
            <ButtonPressable
              disabled={!canSubmit || loading}
              width={'90%'}
              backgroundColor={'base.white'}
              titleColor="base.black"
              title={loading ? 'Please wait...' : 'Submit'}
              fontSize={14}
              fontWeight="bold"
              onPress={editProfileHandler}
            />
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
          </Box>
        );
      default:
        return <></>;
    }
  }, [currentStep]);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(1);
    } else {
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [visible]);

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  const animateHandler = (fromIndex: number, toIndex: number) => {
    if (toIndex === 0) {
      onClose();
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            hideSettings();
            router.replace('/');
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete',
      'Are you sure you want to delete your account? This action cannot be reversed.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAcc();
              hideSettings();
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://dewicats.com/privacy-policy');
    } catch (error) {
      console.error('Error opening privacy policy:', error);
      Alert.alert('Error', 'Failed to open privacy policy.');
    }
  };

  return (
    <Portal>
      <CustomBottomSheet
        sheetProps={{
          onAnimate: animateHandler,
          snapPoints: [1, 550],
          index: 0,
          backdropComponent: props => (
            <BottomSheetBackdrop
              {...props}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              onPress={hideSettings}
            />
          ),
        }}
        ref={bottomSheetRef}
      >
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
        </Animated.View>
      </CustomBottomSheet>
    </Portal>
  );
}
