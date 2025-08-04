import CircleLoader from '@/components/CircleLoader';
import Box from '@/components/ui/Box';
import ImageBox from '@/components/ui/ImageBox';
import Text from '@/components/ui/Text';
import { useConversations } from '@/hooks/useMessages';
import { Conversation } from '@/lib/messagingAPI';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocationsStackNavigationProp } from '../locations/LocationsNavigator';
import { ChatStackNavigationProp } from './ChatNavigator';

// Simple date formatting without external dependencies
const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Individual conversation card component
function ConversationCard({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Box
        paddingHorizontal="4"
        paddingVertical="4"
        backgroundColor="cardBackground"
        marginBottom="1"
        flexDirection="row"
        alignItems="center"
      >
        {/* Avatar */}
        <ImageBox
          source={require('@assets/images/profile-pic.png')}
          width={48}
          height={48}
          borderRadius={'full'}
          marginRight="3"
        />

        {/* Content */}
        <Box flex={1} gap="1">
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text
              variant="textMdSemibold"
              color="primaryBackground"
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {conversation.other_user?.email?.split('@')[0] || 'Peroni Alt'}
            </Text>
            <Text variant="textXsRegular" color="secondaryText">
              {formatTimeAgo(conversation.last_message_at)}
            </Text>
          </Box>

          <Text variant="textSmRegular" color="secondaryText" numberOfLines={1} style={{ flex: 1 }}>
            {conversation.last_message || 'Hey I have a helium hotspot...'}
          </Text>
        </Box>

        {/* Location thumbnail */}
        <Box
          style={{ width: 60, height: 45 }}
          borderRadius="lg"
          backgroundColor="blue.500"
          alignItems="center"
          justifyContent="center"
          marginLeft="3"
        >
          {conversation.location?.gallery?.[0] ? (
            <ImageBox
              source={{ uri: conversation.location.gallery[0] }}
              borderRadius="lg"
              width={60}
              height={45}
              style={{ width: 60, height: 45 }}
            />
          ) : (
            <Text variant="textSmBold" color="primaryBackground">
              📍
            </Text>
          )}
        </Box>
      </Box>
    </Pressable>
  );
}

export default function ChatListScreen() {
  const nav = useNavigation<ChatStackNavigationProp>();
  const locationsNav = useNavigation<LocationsStackNavigationProp>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, session, hydrated } = useAuthStore();
  const { mockMode, setMockMode } = useAppStore();

  const { conversations, loading, error, refreshing, refreshConversations } = useConversations();

  // Debug auth state when component mounts
  useEffect(() => {
    console.log('💬 ChatListScreen - Auth Debug:', {
      hydrated,
      hasUser: !!user,
      hasSession: !!session,
      hasToken: !!session?.access_token,
      userEmail: user?.email,
      mockMode,
      loading,
      error,
    });
  }, [hydrated, user, session, mockMode, loading, error]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const userEmail = conv.other_user?.email?.toLowerCase() || '';
    const locationTitle = conv.location?.title?.toLowerCase() || '';
    const lastMessage = conv.last_message?.toLowerCase() || '';

    return (
      userEmail.includes(query) || locationTitle.includes(query) || lastMessage.includes(query)
    );
  });

  const handleConversationPress = (conversation: Conversation) => {
    //TODO fix
    nav.push('chat/Conversation' as any, { conversationId: conversation.id });
  };

  const toggleMockMode = () => {
    console.log('🔄 Toggling mock mode from', mockMode, 'to', !mockMode);
    setMockMode(!mockMode);
    refreshConversations();
  };

  const renderEmptyState = () => (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="8"
      style={{ marginTop: 100 }}
    >
      <Text variant="textLgBold" color="primaryBackground" textAlign="center" marginBottom="2">
        💬 No conversations yet
      </Text>
      <Text variant="textMdRegular" color="secondaryText" textAlign="center" marginBottom="6">
        Start a conversation by messaging someone about a location post
      </Text>
      <Pressable
        onPress={() => locationsNav.push('Locations')}
        style={{
          backgroundColor: '#3b82f6',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text variant="textMdBold" color="primaryBackground">
          Browse Locations
        </Text>
      </Pressable>
    </Box>
  );

  const renderErrorState = () => (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="8"
      style={{ marginTop: 100 }}
    >
      <Text variant="textLgBold" style={{ color: '#ef4444' }} textAlign="center" marginBottom="2">
        ⚠️ Error loading conversations
      </Text>
      <Text variant="textMdRegular" color="secondaryText" textAlign="center" marginBottom="6">
        {error}
      </Text>
      <Pressable
        onPress={refreshConversations}
        style={{
          backgroundColor: '#3b82f6',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text variant="textMdBold" color="primaryBackground">
          Try Again
        </Text>
      </Pressable>
    </Box>
  );

  const renderLoadingState = () => (
    <Box flex={1} alignItems="center" justifyContent="center" style={{ marginTop: 100 }}>
      <CircleLoader />
      <Text variant="textMdRegular" color="secondaryText" marginTop="4">
        Loading conversations...
      </Text>
    </Box>
  );

  // Show loading state if not hydrated yet
  if (!hydrated) {
    return (
      <Box flex={1} backgroundColor="primaryBackground" alignItems="center" justifyContent="center">
        <CircleLoader />
        <Text variant="textMdRegular" color="secondaryText" marginTop="4">
          Loading auth state...
        </Text>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box flex={1} backgroundColor="primaryBackground" alignItems="center" justifyContent="center">
        <Text variant="textLgBold" color="primaryBackground" textAlign="center" marginBottom="4">
          Please sign in to view messages
        </Text>
        <Pressable
          onPress={() => router.push('/(auth)/WelcomeScreen' as any)}
          style={{
            backgroundColor: '#3b82f6',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text variant="textMdBold" color="primaryBackground">
            Sign In
          </Text>
        </Pressable>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="primaryBackground">
      {/* Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        paddingHorizontal="4"
        paddingVertical="4"
        backgroundColor="primaryBackground"
        style={{
          paddingTop: insets.top + 16,
        }}
      >
        {/* Title */}
        <Text variant="textXlBold" color="primaryBackground">
          Chat
        </Text>
      </Box>

      {/* Search bar */}
      <Box paddingHorizontal="4" paddingBottom="4">
        <Box
          backgroundColor="inputBackground"
          borderRadius="xl"
          paddingHorizontal="4"
          paddingVertical="3"
          flexDirection="row"
          alignItems="center"
        >
          <Text style={{ fontSize: 16, color: '#888', marginRight: 8 }}>🔍</Text>
          <TextInput
            placeholder="Filter Messages"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              fontSize: 16,
              color: '#ffffff',
              fontFamily: 'Figtree',
            }}
          />
        </Box>

        {/* Debug info */}
        <Box marginTop="2">
          <Text variant="textXsRegular" color="secondaryText">
            Auth: {hydrated ? (user ? '✅ Signed In' : '❌ Not Signed In') : '⏳ Loading...'}
          </Text>
          <Pressable onPress={toggleMockMode}>
            <Text variant="textXsRegular" color="blue.500">
              {mockMode ? 'Mock Mode' : 'Live Mode'} • Tap to toggle
            </Text>
          </Pressable>
        </Box>
      </Box>

      {/* Conversations list */}
      <Box flex={1}>
        <FlatList
          data={filteredConversations}
          renderItem={({ item }) => (
            <ConversationCard conversation={item} onPress={() => handleConversationPress(item)} />
          )}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            loading ? renderLoadingState : error ? renderErrorState : renderEmptyState
          }
          contentContainerStyle={{
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshConversations}
              tintColor="#3b82f6"
            />
          }
        />
      </Box>
    </Box>
  );
}
