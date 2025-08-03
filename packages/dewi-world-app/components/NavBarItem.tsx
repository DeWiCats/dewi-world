import Box from '@/components/ui/Box';
import { useColors } from '@/hooks/theme';
import { FC } from 'react';
import { Animated, Insets, LayoutChangeEvent } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';
import { SvgProps } from 'react-native-svg';
import TouchableContainer from './ui/TouchableContainer';

export type NavBarOption = {
  value: string;
  Icon: FC<SvgProps>;
  hasBadge?: boolean;
};

export default function NavBarItem({
  selected,
  onLayout,
  onPress,
  hitSlop,
  Icon,
  value,
  hasBadge,
}: {
  selected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  hitSlop: Insets | undefined;
  hasBadge?: boolean;
} & NavBarOption) {
  const colors = useColors();

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: 1,
        },
      ],
    };
  });

  return (
    <TouchableContainer
      key={value}
      onPress={onPress}
      onLayout={onLayout}
      marginRight="0"
      hitSlop={hitSlop}
      defaultBackground={'base.black'}
      pressedBackgroundColor="gray.900"
      borderColor={'gray.800'}
      borderWidth={1}
      height={50}
      width={50}
      justifyContent={'center'}
      alignItems={'center'}
      borderRadius={'full'}
      shadowColor="base.black"
      shadowOpacity={0.3}
      shadowOffset={{ width: 0, height: 6 }}
      shadowRadius={6}
      pressableStyles={{
        flex: undefined,
      }}
    >
      <Animated.View style={animatedStyles}></Animated.View>
      <Box
        justifyContent="center"
        alignItems="center"
        borderRadius={selected ? 'full' : 'none'}
        padding="2"
        backgroundColor={selected ? 'pink.500' : 'transparent'}
      >
        <Icon height={20} width={20} color={selected ? colors['base.white'] : colors['gray.600']} />
        {hasBadge && (
          <Box
            position="absolute"
            justifyContent="center"
            alignItems="center"
            top={6}
            right={2}
            backgroundColor={selected ? 'primaryText' : 'primaryBackground'}
            borderRadius="full"
            height={10}
            width={10}
          >
            <Box
              backgroundColor={selected ? 'primaryBackground' : 'green.500'}
              borderRadius="full"
              height={6}
              width={6}
            />
          </Box>
        )}
      </Box>
    </TouchableContainer>
  );
}
