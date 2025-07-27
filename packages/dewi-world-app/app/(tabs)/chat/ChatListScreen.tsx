import CircleLoader from '@/components/CircleLoader';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { useConversations } from '@/hooks/useMessages';
import { Conversation } from '@/lib/messagingAPI';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, TextInput } from 'react-native';
// Simple date formatting without external dependencies
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// Individual conversation card component
function ConversationCard({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  // Use the formatTime function defined above

  const hasUnread = (conversation.unread_count || 0) > 0;

  return (
    <Pressable onPress={onPress}>
      <Box
        paddingHorizontal="4"
        paddingVertical="4"
        backgroundColor="cardBackground"
        marginBottom="2"
        borderRadius="lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Box flexDirection="row" alignItems="center" gap="3">
          {/* Avatar */}
          <Box
            style={{ width: 48, height: 48 }}
            borderRadius="full"
            backgroundColor="blue.500"
            alignItems="center"
            justifyContent="center"
          >
            <Text variant="textSmBold" color="primaryBackground">
              {conversation.other_user?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </Box>

          {/* Content */}
          <Box flex={1} gap="1">
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Text variant="textMdBold" color="primaryText" numberOfLines={1} style={{ flex: 1 }}>
                {conversation.other_user?.email || 'Unknown User'}
              </Text>
              <Text variant="textSmRegular" color="secondaryText">
                {formatTime(conversation.last_message_at)}
              </Text>
            </Box>

            {/* Location info if available */}
            {conversation.location && (
              <Text variant="textSmRegular" color="blue.500" numberOfLines={1}>
                📍 {conversation.location.title}
              </Text>
            )}

            {/* Last message */}
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Text
                variant="textSmRegular"
                color={hasUnread ? 'primaryText' : 'secondaryText'}
                style={{
                  fontWeight: hasUnread ? '600' : '400',
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {conversation.last_message || 'No messages yet'}
              </Text>

              {/* Unread badge */}
              {hasUnread && (
                <Box
                  backgroundColor="blue.500"
                  borderRadius="full"
                  paddingHorizontal="2"
                  paddingVertical="1"
                  style={{ minWidth: 20 }}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text variant="textXsRegular" color="primaryBackground">
                    {conversation.unread_count! > 99 ? '99+' : conversation.unread_count}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
}

export default function ChatListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();
  const { mockMode, setMockMode } = useAppStore();

  const { conversations, loading, error, refreshing, refreshConversations } = useConversations();

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
    // Navigate to chat detail screen
    router.push(`/(tabs)/chat/${conversation.id}` as any);
  };

  const toggleMockMode = () => {
    setMockMode(!mockMode);
    refreshConversations();
  };

  const renderHeader = () => (
    <Box
      paddingHorizontal="4"
      paddingTop="4"
      paddingBottom="2"
      style={{
        paddingTop: 120,
      }}
    >
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="4">
        <Box>
          <Text variant="textXlBold" color="primaryText">
            Messages
          </Text>
          <Pressable onPress={toggleMockMode}>
            <Text variant="textSmRegular" color="blue.500">
              {mockMode ? 'Mock Mode' : 'Live Mode'} • Tap to toggle
            </Text>
          </Pressable>
        </Box>

        {/* Total unread count */}
        {conversations.length > 0 && (
          <Box alignItems="center">
            <Text variant="textMdBold" color="primaryText">
              {conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0)}
            </Text>
            <Text variant="textXsRegular" color="secondaryText">
              unread
            </Text>
          </Box>
        )}
      </Box>

      {/* Search bar */}
      <Box
        backgroundColor="inputBackground"
        borderRadius="xl"
        paddingHorizontal="4"
        paddingVertical="3"
        marginBottom="4"
      >
        <TextInput
          placeholder="Search conversations..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            fontSize: 16,
            color: '#ffffff',
            fontFamily: 'Figtree',
          }}
        />
      </Box>
    </Box>
  );

  const renderEmptyState = () => (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="8"
      style={{ marginTop: 100 }}
    >
      <Text variant="textLgBold" color="primaryText" textAlign="center" marginBottom="2">
        💬 No conversations yet
      </Text>
      <Text variant="textMdRegular" color="secondaryText" textAlign="center" marginBottom="6">
        Start a conversation by messaging someone about a location post
      </Text>
      <Pressable
        onPress={() => router.push('/(tabs)/locations' as any)}
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

  if (!user) {
    return (
      <Box flex={1} backgroundColor="primaryBackground" alignItems="center" justifyContent="center">
        <Text variant="textLgBold" color="primaryText" textAlign="center" marginBottom="4">
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
      <FlatList
        data={filteredConversations}
        renderItem={({ item }) => (
          <ConversationCard conversation={item} onPress={() => handleConversationPress(item)} />
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          loading ? renderLoadingState : error ? renderErrorState : renderEmptyState
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
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
  );
}
