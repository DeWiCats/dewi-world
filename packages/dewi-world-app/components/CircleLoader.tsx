/* eslint-disable react/jsx-props-no-spreading */
import { Color, Theme } from '@/constants/theme';
import { useColors } from '@/hooks/theme';
import CircleLoaderSvg from '@assets/svgs/circleLoader.svg';
import { BoxProps } from '@shopify/restyle';
import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Box from './ui/Box';
import Text from './ui/Text';

type Props = BoxProps<Theme> & {
  text?: string;
  loaderSize?: number;
  color?: Color;
};
const CircleLoader = ({
  text,
  loaderSize = 30,
  minHeight,
  color = 'primaryText',
  ...props
}: Props) => {
  const rotateAnim = useRef(new Animated.Value(0));
  const opacityAnim = useRef(new Animated.Value(0));
  const colors = useColors();

  const anim = () => {
    Animated.loop(
      Animated.timing(rotateAnim.current, {
        toValue: -1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();

    Animated.timing(opacityAnim.current, {
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const scan = async () => {
      anim();
    };
    scan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box {...props} overflow="hidden" alignItems="center" minHeight={minHeight || loaderSize}>
      <Animated.View
        style={{
          flex: 1,
          maxHeight: 105,
          height: loaderSize,
          width: loaderSize,
          opacity: opacityAnim.current,
          transform: [
            {
              rotate: rotateAnim.current.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }}
      >
        <CircleLoaderSvg color={colors[color]} height={loaderSize} width={loaderSize} />
      </Animated.View>
      {text && (
        <Text
          textAlign="center"
          variant="textSmRegular"
          marginTop="8"
          color="gray.600"
          textTransform="uppercase"
        >
          {text}
        </Text>
      )}
    </Box>
  );
};

export default memo(CircleLoader);
