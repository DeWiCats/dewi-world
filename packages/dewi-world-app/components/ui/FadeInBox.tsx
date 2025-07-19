import { ComponentProps, PropsWithChildren, useEffect, useRef } from "react";
import { Animated } from "react-native";
import { AnimatedBox } from "./AnimatedBox";
import Box from "./Box";

type FadeInBoxProps = PropsWithChildren<{
  delay?: number;
  fadeIn?: boolean;
} & ComponentProps<typeof Box>>;

export default function FadeInBox({ fadeIn = true, delay = 1000, children, width = "100%", height = "100%" }: FadeInBoxProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const reactive = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!fadeIn) return

    Animated.timing(animatedValue, {
      toValue: reactive,
      duration: delay,
      useNativeDriver: true,
    }).start();

    return () => {
      animatedValue.resetAnimation()
    }
  }, [fadeIn]);

  return (
    <AnimatedBox
      width={width}
      height={height}
      style={{
        opacity: animatedValue
      }}
    >
      {children}
    </AnimatedBox>
  );
}
