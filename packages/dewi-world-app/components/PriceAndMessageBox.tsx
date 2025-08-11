import { GeoJSONLocation } from '@/lib/geojsonAPI';
import { useTabsStore } from '@/stores/useTabsStore';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { AnimatedStyle } from 'react-native-reanimated';
import ButtonPressable from './ButtonPressable';
import { ReAnimatedBox } from './Reanimated';
import { ServiceSheetStackNavigationProp } from './ServiceSheetLayout';
import Box from './ui/Box';
import Text from './ui/Text';

interface PriceAndMessageBoxProps {
  location?: null | GeoJSONLocation;
  style?: StyleProp<ViewStyle>;
  animatedStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  isOwn?: boolean;
}

export default function PriceAndMessageBox({
  location,
  animatedStyle,
  style,
  isOwn = false,
}: PriceAndMessageBoxProps) {
  //const { createConversation } = useConversations();
  const nav = useNavigation<ServiceSheetStackNavigationProp>();
  const router = useRouter();
  const { tabBarVisible } = useTabsStore();

  const handleMessageOwner = useCallback(async () => {
    console.log('Attempting to message owner...');
    nav.navigate('ChatTab');

    router.replace({
      pathname: '/(tabs)/chat',
    });

    /*router.replace({
      pathname: '/(tabs)/chat',
      params: { conversationId: '6c05a2d9-b025-4303-98c7-1664042476a0' },
    });*/

    /*if (!location) return;
    try {
      console.log('Attempting to message owner...');

      const request: CreateConversationRequest = {
        receiver_id: location.properties.owner_id,
        location_id: location.properties.id,
        initial_message:
          "Hello, I'm interested in your location post at " +
          location.properties.address +
          ". Happy to chat if the timing's right!",
      };

      const response = await createConversation(request);

      console.log('Successfully created the following conversation:', response);

      //TODO fix
      router.push({
        pathname: '/(tabs)/chat/Conversation',
        params: { conversationId: response.id },
      });
    } catch (error) {
      console.error('Error while trying to message location owner:', error);
    }*/
  }, [location]);

  return (
    <ReAnimatedBox style={animatedStyle}>
      {!tabBarVisible && location && (
        <Box
          backgroundColor={'primaryBackground'}
          borderTopWidth={1}
          borderTopColor={'gray.700'}
          flexDirection="row"
          width="100%"
          justifyContent={'space-between'}
          alignItems={'center'}
          style={style}
        >
          <Text variant="textXlBold" color="text.white">
            ${location.properties.price}
            {location.properties.is_negotiable ? '/mo' : '/mo (fixed)'}
          </Text>
          <ButtonPressable
            onPress={handleMessageOwner}
            fontSize={16}
            innerContainerProps={{ padding: 'xl' }}
            title={isOwn ? 'View Conversation' : 'Message Owner'}
            backgroundColor={'pink.500'}
            backgroundColorPressed="pink.400"
          />
        </Box>
      )}
    </ReAnimatedBox>
  );
}
