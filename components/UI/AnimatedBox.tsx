import { ComponentProps, ReactNode } from "react";
import Box from "./Box";
import { Animated, ViewProps } from "react-native";
import { boxRestyleFunctions, createRestyleComponent, RestyleFunctionContainer } from "@shopify/restyle";
import { Theme } from "@/constants/theme";

type BoxProps = ComponentProps<typeof Box>;
type AnimatedViewProps = Animated.AnimatedProps<ViewProps & {children?: ReactNode}>;
type Props = BoxProps & AnimatedViewProps;

export const AnimatedBox = createRestyleComponent<
  BoxProps & Omit<Props, keyof BoxProps>,
  Theme
>(
  boxRestyleFunctions as RestyleFunctionContainer<BoxProps, Theme>[],
  Animated.View,
);