import { Color, Theme } from '@/constants/theme';
import { useColors, useCreateOpacity } from '@/hooks/theme';
import { debounce } from '@/utils/debounce';
import { BoxProps } from '@shopify/restyle';
import React, { useCallback } from 'react';
import {
  AccessibilityRole,
  GestureResponderEvent,
  Insets,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ReAnimatedBox } from './Box';

export type ButtonPressAnimationProps = {
  onPress?: ((event: GestureResponderEvent) => void) | null | undefined;
  onPressIn?: ((event: GestureResponderEvent) => void) | null | undefined;
  onPressOut?: ((event: GestureResponderEvent) => void) | null | undefined;
  hasPressedState?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  pressableStyles?: ViewStyle;
  onLayout?: (event: LayoutChangeEvent) => void | undefined;
  hitSlop?: Insets | undefined;
  disabledOpacity?: number;
  defaultBackground?: keyof Theme['colors'];
  customBackgroundColor?: string;
  customPressedBackgroundColor?: string;
  pressedBackgroundColor?: Color;
  customDisabledBackgroundColor?: string;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
} & BoxProps<Theme>;

const TouchableContainer = ({
  hasPressedState = true,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  children,
  pressableStyles,
  onLayout,
  hitSlop,
  disabledOpacity = 1,
  defaultBackground = 'cardBackground',
  customBackgroundColor,
  pressedBackgroundColor,
  customPressedBackgroundColor,
  customDisabledBackgroundColor,
  accessibilityLabel,
  accessibilityRole,
  ...boxProps
}: ButtonPressAnimationProps) => {
  const { backgroundStyle: generateBackgroundStyle } = useCreateOpacity();
  const colors = useColors();
  const getBackgroundColorStyle = useCallback(
    (pressed: boolean) => {
      if (!hasPressedState) return undefined;

      if (disabled) {
        return customDisabledBackgroundColor
          ? { backgroundColor: customDisabledBackgroundColor }
          : generateBackgroundStyle(defaultBackground, disabledOpacity);
      }

      if (pressed) {
        if (customPressedBackgroundColor) {
          return { backgroundColor: customPressedBackgroundColor };
        }
        if (pressedBackgroundColor) {
          return { backgroundColor: colors[pressedBackgroundColor] };
        }
        return generateBackgroundStyle('activeBackground', 1.0);
      }
      return customBackgroundColor
        ? { backgroundColor: customBackgroundColor }
        : generateBackgroundStyle(defaultBackground, 1.0);
    },
    [
      colors,
      customBackgroundColor,
      customDisabledBackgroundColor,
      defaultBackground,
      disabled,
      disabledOpacity,
      generateBackgroundStyle,
      hasPressedState,
      pressedBackgroundColor,
      customPressedBackgroundColor,
    ]
  );

  return (
    <Pressable
      onPress={debounce(onPress)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={pressableStyles || styles.pressable}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessible
    >
      {({ pressed }) => (
        <ReAnimatedBoxWrapper
          style={getBackgroundColorStyle(pressed)}
          onLayout={onLayout}
          hitSlop={hitSlop}
          {...boxProps}
        >
          {children}
        </ReAnimatedBoxWrapper>
      )}
    </Pressable>
  );
};

const ReAnimatedBoxWrapper = ({
  children,
  style,
  onLayout,
  hitSlop,
  ...props
}: BoxProps<Theme> & {
  children: React.ReactNode;
  style: ViewStyle | undefined;
  onLayout?: (event: LayoutChangeEvent) => void | undefined;
  hitSlop?: Insets | undefined;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: style?.backgroundColor
        ? withTiming(style?.backgroundColor as string)
        : undefined,
    };
  });
  return (
    <ReAnimatedBox {...props} style={animatedStyle} onLayout={onLayout} hitSlop={hitSlop}>
      {children}
    </ReAnimatedBox>
  );
};

const styles = StyleSheet.create({ pressable: { width: '100%' } });

export default TouchableContainer;
