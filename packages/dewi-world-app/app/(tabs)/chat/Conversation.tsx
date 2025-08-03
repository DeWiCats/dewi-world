import LeftArrow from '@/assets/svgs/leftArrow.svg';
import CircleLoader from '@/components/CircleLoader';
import Box from '@/components/ui/Box';
import ImageBox from '@/components/ui/ImageBox';
import Text from '@/components/ui/Text';
import TouchableContainer from '@/components/ui/TouchableContainer';
import { useMessages, useTypingIndicator } from '@/hooks/useMessages';
import { Message } from '@/lib/messagingAPI';
import { useAuthStore } from '@/stores/useAuthStore';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabsContext } from '../context';
import { ChatStackParamList } from './ChatNavigator';

const { width: screenWidth } = Dimensions.get('window');

// Simple date formatting for messages
const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
    hour12: true,
  });
};

// Message bubble component
function MessageBubble({
  message,
  isOwn,
  showTimestamp,
}: {
  message: Message;
  isOwn: boolean;
  showTimestamp: boolean;
}) {
  return (
    <Box marginBottom="2">
      {/* Timestamp */}
      {showTimestamp && (
        <Box alignItems="center" marginBottom="2">
          <Text variant="textXsRegular" color="secondaryText">
            {formatMessageTime(message.created_at)}
          </Text>
        </Box>
      )}

      {/* Message bubble */}
      <Box alignItems={isOwn ? 'flex-end' : 'flex-start'} paddingHorizontal="4">
        <Box
          backgroundColor={isOwn ? 'base.white' : 'primaryBackground'}
          borderRadius="lg"
          paddingHorizontal="4"
          paddingVertical="3"
          style={{
            maxWidth: screenWidth * 0.75,
            borderTopLeftRadius: isOwn ? 16 : 4,
            borderTopRightRadius: isOwn ? 4 : 16,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <Text
            variant="textMdRegular"
            color={isOwn ? 'base.black' : 'text.white'}
            style={{ lineHeight: 20 }}
          >
            {message.message}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

// Typing indicator component
function TypingIndicator({ typingUsers }: { typingUsers: string[] }) {
  if (typingUsers.length === 0) return null;

  return (
    <Box paddingHorizontal="4" marginBottom="2">
      <Box
        backgroundColor="cardBackground"
        borderRadius="lg"
        paddingHorizontal="4"
        paddingVertical="3"
        style={{
          maxWidth: screenWidth * 0.6,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <Text variant="textSmRegular" color="secondaryText" style={{ fontStyle: 'italic' }}>
          {typingUsers.length === 1 ? 'Typing...' : `${typingUsers.length} people typing...`}
        </Text>
      </Box>
    </Box>
  );
}

export type Route = RouteProp<ChatStackParamList, 'Conversation'>;

export default function ChatDetailScreen() {
  const router = useRouter();
  const route = useRoute<Route>();
  const { conversationId } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const context = useContext(TabsContext);

  useEffect(() => {
    context.hideHeader();
    context.hideTabBar();
    return () => {
      context.showHeader();
      context.showTabBar();
    };
  }, []);

  const {
    messages,
    loading,
    error,
    hasMore,
    loadingMore,
    sendMessage,
    loadMoreMessages,
    markAsRead,
  } = useMessages(conversationId || '');

  const { isTyping, typingUsers, startTyping, stopTyping } = useTypingIndicator(
    conversationId || ''
  );

  // Mark messages as read when entering the screen
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      markAsRead();
    }
  }, [conversationId, messages.length, markAsRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !conversationId || isSending) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);
    stopTyping();

    try {
      // Find the other user in the conversation (we need this for the API)
      const otherUserId = 'other-user-id'; // This should come from conversation data
      const senderId = user?.email as string;

      await sendMessage({
        receiver_id: otherUserId,
        sender_id: senderId,
        message: messageText,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setInputText(messageText); // Restore the message text
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

    // Trigger typing indicator
    if (text.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const renderMessage = ({ item: message, index }: { item: Message; index: number }) => {
    console.log('message', message);
    const isOwn = message.sender_id === user?.email;
    console.log('isOwn', isOwn);

    // Show timestamp if it's the first message or if there's a significant time gap
    const previousMessage = index < messages.length - 1 ? messages[index + 1] : null;
    const showTimestamp =
      !previousMessage ||
      new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() >
        5 * 60 * 1000;

    return <MessageBubble message={message} isOwn={isOwn} showTimestamp={showTimestamp} />;
  };

  const renderHeader = () => (
    <Box>
      {typingUsers.length > 0 && <TypingIndicator typingUsers={typingUsers} />}
      {loadingMore && (
        <Box alignItems="center" paddingVertical="4">
          <CircleLoader />
        </Box>
      )}
    </Box>
  );

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      loadMoreMessages();
    }
  };

  if (!conversationId) {
    return (
      <Box flex={1} backgroundColor="base.black" alignItems="center" justifyContent="center">
        <Text variant="textLgBold" color="primaryText">
          Invalid conversation
        </Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box flex={1} backgroundColor="base.black" alignItems="center" justifyContent="center">
        <CircleLoader />
        <Text variant="textMdRegular" color="secondaryText" marginTop="4">
          Loading messages...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={1} backgroundColor="base.black" alignItems="center" justifyContent="center">
        <Text variant="textLgBold" style={{ color: '#ef4444' }} textAlign="center" marginBottom="4">
          Error loading messages
        </Text>
        <Text variant="textMdRegular" color="secondaryText" textAlign="center" marginBottom="6">
          {error}
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            backgroundColor: '#3b82f6',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text variant="textMdBold" color="primaryBackground">
            Go Back
          </Text>
        </Pressable>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="base.black">
      <KeyboardAvoidingView flex={1} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <Box
          flexDirection="row"
          alignItems="center"
          paddingHorizontal="4"
          paddingVertical="3"
          backgroundColor="cardBackground"
          style={{
            paddingTop: insets.top + 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          {/* Back button */}
          <TouchableContainer
            onPress={() => router.back()}
            justifyContent={'center'}
            alignItems={'center'}
            padding={'4'}
            borderRadius={'full'}
            width={48}
            height={48}
            defaultBackground={'base.black'}
            pressedBackgroundColor={'gray.900'}
            pressableStyles={{
              flex: undefined,
            }}
            shadowColor={'base.black'}
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.25}
            shadowRadius={3.84}
            elevation={5}
          >
            <LeftArrow width={20} height={20} />
          </TouchableContainer>

          {/* Profile info */}
          <Box flex={1} flexDirection="row" alignItems="center">
            <ImageBox
              source={require('@assets/images/profile-pic.png')}
              width={40}
              height={40}
              borderRadius={'full'}
              marginRight="3"
            />
            <Box>
              <Text variant="textMdBold" color="primaryBackground">
                Peroni Alt
              </Text>
              <Text variant="textSmRegular" color="secondaryText">
                $100
              </Text>
            </Box>
          </Box>

          {/* Location thumbnail */}
          <Box
            style={{ width: 50, height: 40 }}
            borderRadius="lg"
            backgroundColor="blue.500"
            alignItems="center"
            justifyContent="center"
          >
            <Text variant="textSmBold" color="primaryBackground">
              📍
            </Text>
          </Box>
        </Box>

        {/* Messages list */}
        <Box flex={1}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            inverted
            ListHeaderComponent={renderHeader}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            contentContainerStyle={{
              paddingVertical: 16,
              flexGrow: messages.length === 0 ? 1 : undefined,
            }}
            ListEmptyComponent={
              <Box flex={1} alignItems="center" justifyContent="center">
                <Text variant="textLgBold" color="primaryText" textAlign="center" marginBottom="2">
                  💬 Start the conversation
                </Text>
                <Text variant="textMdRegular" color="secondaryText" textAlign="center">
                  Send a message to get started
                </Text>
              </Box>
            }
            showsVerticalScrollIndicator={false}
          />
        </Box>

        {/* Message input */}
        <Box
          backgroundColor="cardBackground"
          paddingHorizontal="4"
          paddingVertical="3"
          style={{
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box flexDirection="row" alignItems="flex-end" gap="3">
            <Box
              flex={1}
              backgroundColor="inputBackground"
              borderRadius="xl"
              paddingHorizontal="4"
              paddingVertical="3"
              style={{ minHeight: 44 }}
            >
              <TextInput
                value={inputText}
                onChangeText={handleInputChange}
                placeholder="Type a message..."
                placeholderTextColor="#888"
                multiline
                maxLength={1000}
                style={{
                  fontSize: 16,
                  color: '#ffffff',
                  fontFamily: 'Figtree',
                  maxHeight: 100,
                  paddingTop: Platform.OS === 'ios' ? 8 : 4,
                  paddingBottom: Platform.OS === 'ios' ? 8 : 4,
                }}
              />
            </Box>

            {/* Send button */}
            {(inputText.trim().length > 0 || isSending) && (
              <Pressable
                onPress={handleSendMessage}
                disabled={isSending}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#e879f9', // Purple/pink color from the design
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isSending ? 0.5 : 1,
                }}
              >
                {isSending ? (
                  <CircleLoader color="#ffffff" size={20} />
                ) : (
                  <Text style={{ fontSize: 18, color: '#ffffff' }}>→</Text>
                )}
              </Pressable>
            )}
          </Box>
        </Box>
      </KeyboardAvoidingView>
    </Box>
  );
}
