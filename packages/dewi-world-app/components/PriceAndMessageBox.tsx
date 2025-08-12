import { GeoJSONLocation } from '@/lib/geojsonAPI';
import { useTabsStore } from '@/stores/useTabsStore';
import { StyleProp, ViewStyle } from 'react-native';
import { AnimatedStyle } from 'react-native-reanimated';
import ButtonPressable from './ButtonPressable';
import { ReAnimatedBox } from './Reanimated';
import Box from './ui/Box';
import Text from './ui/Text';

interface PriceAndMessageBoxProps {
  location?: null | GeoJSONLocation;
  style?: StyleProp<ViewStyle>;
  animatedStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  isOwn?: boolean;
  onMessageOwner: () => void;
}

export default function PriceAndMessageBox({
  location,
  animatedStyle,
  style,
  isOwn = false,
  onMessageOwner,
}: PriceAndMessageBoxProps) {
  const { tabBarVisible } = useTabsStore();

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
            onPress={onMessageOwner}
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
