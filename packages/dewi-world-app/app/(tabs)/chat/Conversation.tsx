import LeftArrow from '@/assets/svgs/leftArrow.svg';
import CircleLoader from '@/components/CircleLoader';
import Box from '@/components/ui/Box';
import ImageBox from '@/components/ui/ImageBox';
import Text from '@/components/ui/Text';
import TouchableContainer from '@/components/ui/TouchableContainer';
import { useConversation, useMessages, useTypingIndicator } from '@/hooks/useMessages';
import { Message } from '@/lib/messagingTypes';
import { Profile } from '@/lib/usersAPI';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTabsStore } from '@/stores/useTabsStore';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatStackParamList } from './ChatNavigator';

const { width: screenWidth } = Dimensions.get('window');

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showTimestamp: boolean;
}

const MessageBubble = ({ message, isOwn, showTimestamp }: MessageBubbleProps) => {
  const messageContent = message.content || '[Empty message]';

  return (
    <View style={[styles.messageBubble, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <Text
        variant="textMdLight"
        style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}
      >
        {messageContent}
      </Text>
      {showTimestamp && (
        <Text style={styles.timestamp}>{new Date(message.created_at).toLocaleTimeString()}</Text>
      )}
      {isOwn && (
        <View
          style={[
            styles.readReceipt,
            { backgroundColor: message.is_read ? 'transparent' : '#007AFF' },
          ]}
        />
      )}
    </View>
  );
};

// Animated typing dots component
function AnimatedTypingDots() {
  const [dotCount, setDotCount] = React.useState(1);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev >= 3 ? 1 : prev + 1));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Text variant="textMdRegular" color="secondaryText">
      {'.'.repeat(dotCount)}
      {' '.repeat(3 - dotCount)}
    </Text>
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
        flexDirection="row"
        alignItems="center"
        style={{
          maxWidth: screenWidth * 0.6,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <AnimatedTypingDots />
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
  const { user, getProfileById } = useAuthStore();

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { hideHeader, hideTabBar, showHeader, showTabBar } = useTabsStore();

  useEffect(() => {
    hideHeader();
    hideTabBar();
    return () => {
      showHeader();
      showTabBar();
    };
  }, []);

  // Get conversation data to find the other participant
  const { conversation, loading: conversationLoading } = useConversation(conversationId || '');

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

  const [profileLoading, setProfileLoading] = useState(true);
  const [otherProfile, setOtherProfile] = useState<null | Profile>(null);

  const { isTyping, typingUsers, startTyping, stopTyping } = useTypingIndicator(
    conversationId || ''
  );
  const [avoidKeyboard, setAvoidKeyboard] = useState(false);

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => setAvoidKeyboard(true));
    Keyboard.addListener('keyboardDidHide', () => setAvoidKeyboard(false));

    return () => {
      Keyboard.removeAllListeners('keyboardDidShow');
      Keyboard.removeAllListeners('keyboardDidHide');
    };
  }, []);

  // Fetch profile information for other user in conversation
  useEffect(() => {
    new Promise(async () => {
      try {
        if (!conversation?.other_user?.id) return;
        setProfileLoading(true);
        const profile = await getProfileById(conversation.other_user.id);
        setOtherProfile(profile);
      } catch (error) {
        console.error('Error fetchin conversation', error);
      } finally {
        setProfileLoading(false);
      }
    });
  }, [conversation]);

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
    if (!inputText.trim() || !conversationId || isSending || !conversation?.other_user?.id) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);
    stopTyping();

    try {
      await sendMessage({
        receiver_id: conversation.other_user.id,
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
    console.log('📱 Rendering message:', {
      id: message.id,
      content: message.content,
      sender_id: message.sender_id,
      created_at: message.created_at,
      is_read: message.is_read,
    });

    const isOwn = message.sender_id === user?.id;
    console.log('👤 Message ownership:', {
      isOwn,
      messageSender: message.sender_id,
      currentUser: user?.id,
    });

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

  if (loading || conversationLoading) {
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
      <KeyboardAvoidingView
        style={{ height: '100%' }}
        enabled={avoidKeyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
            onPress={router.back}
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
            {profileLoading ? (
              <CircleLoader />
            ) : (
              otherProfile && (
                <>
                  <ImageBox
                    source={{ uri: otherProfile.avatar }}
                    width={40}
                    height={40}
                    borderRadius={'full'}
                    marginRight="3"
                  />
                  <Box>
                    <Text variant="textMdBold" color="base.white">
                      {otherProfile.username}
                    </Text>
                    <Text variant="textSmRegular" color="secondaryText" maxWidth="90%" numberOfLines={2}>
                      {conversation?.location?.title || 'General'}
                    </Text>
                  </Box>
                </>
              )
            )}
          </Box>

          {/* Location thumbnail */}
          <Box
            style={{ width: 50, height: 40 }}
            borderRadius="lg"
            backgroundColor="blue.500"
            alignItems="center"
            justifyContent="center"
          >
            {conversation?.location?.gallery?.at(0) ? (
              <ImageBox
                source={{ uri: conversation.location.gallery[0] }}
                borderRadius="lg"
                width={50}
                height={40}
                style={{ width: 50, height: 40 }}
              />
            ) : (
              <Text variant="textSmBold" color="primaryBackground">
                📍
              </Text>
            )}
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
                  <CircleLoader />
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

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  ownMessage: {
    backgroundColor: '#212121', // Purple/pink color from the design
    alignSelf: 'flex-end',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  otherMessage: {
    backgroundColor: '#DD46F8', // Blue color from the design
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.5,
    marginTop: 4,
  },
  readReceipt: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
});
