import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { useConversations } from '@/hooks/useMessages';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable } from 'react-native';

interface MessageButtonProps {
  receiverId: string;
  locationId?: string;
  receiverName?: string;
  locationTitle?: string;
  style?: any;
  variant?: 'primary' | 'secondary' | 'icon';
}

export default function MessageButton({
  receiverId,
  locationId,
  receiverName = 'user',
  locationTitle,
  style,
  variant = 'primary',
}: MessageButtonProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createConversation } = useConversations();

  const handleMessagePress = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to send messages.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/WelcomeScreen' as any) },
      ]);
      return;
    }

    if (receiverId === user.id) {
      Alert.alert('Error', 'You cannot message yourself.');
      return;
    }

    try {
      const conversation = await createConversation({
        receiver_id: receiverId,
        location_id: locationId,
        initial_message: locationTitle
          ? `Hi! I'm interested in your location: ${locationTitle}`
          : `Hi! I saw your listing and would like to know more.`,
      });

      // Navigate to the conversation
      router.push(`/(tabs)/chat/${conversation.id}` as any);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    }
  };

  if (variant === 'icon') {
    return (
      <Pressable onPress={handleMessagePress} style={style}>
        <Box
          style={{ width: 40, height: 40 }}
          borderRadius="full"
          backgroundColor="blue.500"
          alignItems="center"
          justifyContent="center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 16, color: '#ffffff' }}>💬</Text>
        </Box>
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={handleMessagePress}
        style={[
          {
            borderWidth: 1,
            borderColor: '#3b82f6',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            alignItems: 'center',
          },
          style,
        ]}
      >
        <Text variant="textMdRegular" color="blue.500">
          Message {receiverName}
        </Text>
      </Pressable>
    );
  }

  // Primary variant (default)
  return (
    <Pressable
      onPress={handleMessagePress}
      style={[
        {
          backgroundColor: '#3b82f6',
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text variant="textMdBold" color="primaryBackground">
        💬 Message {receiverName}
      </Text>
    </Pressable>
  );
}
