import CustomBottomSheet from '@/components/CustomBottomSheet';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import TouchableContainer from '@/components/ui/TouchableContainer';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

interface SettingsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsBottomSheet({ visible, onClose }: SettingsBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { logout, deleteAcc, user } = useAuthStore();
  const { hideSettings } = useSettingsStore();
  const router = useRouter();

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
    Alert.alert('Delete', 'Are you sure you want to delete your account? This action cannot be reversed.', [
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
    ]);
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
            {/* Delete accoubt */}
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
      </CustomBottomSheet>
    </Portal>
  );
}
