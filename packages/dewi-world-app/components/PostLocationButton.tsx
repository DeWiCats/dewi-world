import Box from '@/components/ui/Box';
import { useColors } from '@/hooks/theme';
import { useStepperStore } from '@/stores/useStepperStore';
import PlusCircle from '@assets/svgs/plus-circle.svg';
import { useCallback } from 'react';
import { Animated } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';
import TouchableContainer from './ui/TouchableContainer';

export default function PostLocationButton() {
  const colors = useColors();
  const { showStepper } = useStepperStore();

  const onPress = useCallback(() => {
    showStepper();
  }, [showStepper]);

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
      onPress={onPress}
      marginRight="0"
      defaultBackground={'base.black'}
      pressedBackgroundColor="gray.900"
      borderColor={'gray.800'}
      borderWidth={1}
      height={50}
      justifyContent={'center'}
      alignItems={'center'}
      borderRadius={'full'}
      shadowColor="base.black"
      shadowOpacity={0.3}
      shadowOffset={{ width: 0, height: 6 }}
      shadowRadius={6}
      pressableStyles={{
        flex: 1,
      }}
    >
      <Animated.View style={animatedStyles}></Animated.View>
      <Box
        justifyContent="center"
        alignItems="center"
        // borderRadius={selected ? 'full' : 'none'}
        padding="2"
        // backgroundColor={selected ? 'pink.500' : 'transparent'}
      >
        <PlusCircle height={25} width={25} color={colors['gray.600']} />
      </Box>
    </TouchableContainer>
  );
}
