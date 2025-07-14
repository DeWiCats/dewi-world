import TouchableOpacityBox from "@/components/TouchableOpacityBox";
import Box from "@/components/ui/Box";
import { useColors } from "@/hooks/theme";
import { FC } from "react";
import { Animated, Insets, LayoutChangeEvent } from "react-native";
import { useAnimatedStyle } from "react-native-reanimated";
import { SvgProps } from "react-native-svg";

export type NavBarOption = {
  value: string;
  Icon: FC<SvgProps>;
  hasBadge?: boolean;
};

export default function NavBarItem({
  selected,
  onLayout,
  onPress,
  onLongPress,
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
    <TouchableOpacityBox
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : {}}
      accessibilityLabel={value}
      onLongPress={onLongPress}
      key={value}
      onPress={onPress}
      onLayout={onLayout}
      marginRight="0"
      hitSlop={hitSlop}
      alignItems="center"
      flexGrow={1}
      flex={1}
    >
      <Animated.View style={animatedStyles}></Animated.View>
      <Box
        justifyContent="center"
        alignItems="center"
        borderRadius={selected ? "full" : "none"}
        padding="2"
        backgroundColor={selected ? "pink.500" : "transparent"}
      >
        <Icon
          height={25}
          width={25}
          color={selected ? colors.primaryBackground : colors.primaryText}
        />
        {hasBadge && (
          <Box
            position="absolute"
            justifyContent="center"
            alignItems="center"
            top={6}
            right={2}
            backgroundColor={selected ? "primaryText" : "primaryBackground"}
            borderRadius="full"
            height={10}
            width={10}
          >
            <Box
              backgroundColor={selected ? "primaryBackground" : "green.500"}
              borderRadius="full"
              height={6}
              width={6}
            />
          </Box>
        )}
      </Box>
    </TouchableOpacityBox>
  );
}
