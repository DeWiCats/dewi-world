import { StyleProp, ViewStyle } from 'react-native';
import ButtonPressable from './ButtonPressable';
import Box from './ui/Box';
import Text from './ui/Text';

interface PriceAndMessageBoxProps {
  price: number;
  isNegotiable: boolean;
  onMessageOwner: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function PriceAndMessageBox({
  price,
  isNegotiable,
  onMessageOwner,
  style,
}: PriceAndMessageBoxProps) {
  return (
    <Box
      backgroundColor={'primaryBackground'}
      borderTopWidth={1}
      borderTopColor={'gray.700'}
      paddingHorizontal="3xl"
      paddingVertical="5xl"
      flexDirection="row"
      width="100%"
      justifyContent={'space-between'}
      alignItems={'center'}
      style={style}
    >
      <Text variant="textXlBold" color="text.white">
        ${price}
        {isNegotiable ? '/mo' : '/mo (fixed)'}
      </Text>
      <ButtonPressable
        onPress={onMessageOwner}
        fontSize={16}
        innerContainerProps={{ padding: 'xl' }}
        title="Message Owner"
        backgroundColor={'pink.500'}
        backgroundColorPressed="pink.400"
      />
    </Box>
  );
}
