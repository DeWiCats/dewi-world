import { Theme } from "@/constants/theme";
import { createBox } from "@shopify/restyle";
import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import WithDebounce from "./WithDebounce";

const TouchableOpacityBox = createBox<
  Theme,
  TouchableOpacityProps & {
    children?: React.ReactNode;
  }
>(TouchableOpacity);

export default TouchableOpacityBox;

export type TouchableOpacityBoxProps = React.ComponentProps<
  typeof TouchableOpacityBox
>;
export const DebouncedTouchableOpacityBox = WithDebounce(TouchableOpacityBox);
