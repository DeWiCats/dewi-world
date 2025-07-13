import { Insets, LayoutChangeEvent, LayoutRectangle } from "react-native";
import Box from "../../UI/Box";
import { TouchableOpacityBoxProps } from "./TouchableOpacityBox";
import { SvgProps } from "react-native-svg";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useVerticalHitSlop } from "@/hooks/theme";
import { useSharedValue, withSpring } from "react-native-reanimated";
import NavBarItem from "./NavBarItem";

export type ServiceNavBarOption = {
  value: string
  Icon: FC<SvgProps>
  iconProps?: SvgProps
}

type NavServiceBarProps = {
  navBarOptions: Array<ServiceNavBarOption>
  selectedValue: string
  onItemSelected: (value: string) => void
  onItemLongPress: (value: string) => void
  hitSlop?: Insets
} & TouchableOpacityBoxProps

export default function ServiceNavBar({
  navBarOptions,
  selectedValue,
  onItemSelected,
  onItemLongPress,
  ...containerProps
}: NavServiceBarProps)  {
  const hitSlop = useVerticalHitSlop('6')
  const [itemRects, setItemRects] = useState<Record<string, LayoutRectangle>>()

  const offset = useSharedValue<number | null>(null)

  const handleLayout = useCallback(
    (value: string) => (e: LayoutChangeEvent) => {
      e.persist()

      setItemRects((x) => ({ ...x, [value]: e.nativeEvent.layout }))
    },
    [],
  )

  const handlePress = useCallback(
    (value: string) => () => {
      onItemSelected(value)
    },
    [onItemSelected],
  )

  const handleLongPress = useCallback(
    (value: string) => () => {
      onItemLongPress(value)
    },
    [onItemLongPress],
  )

  useEffect(() => {
    const nextOffset = itemRects?.[selectedValue]?.x || 0

    if (offset.value === null) {
      // Don't animate on first position update
      offset.value = nextOffset
      return
    }

    offset.value = withSpring(nextOffset, { mass: 0.5 })
  }, [itemRects, offset, selectedValue])

  const items = useMemo(() => {
    return navBarOptions.map((o) => (
      <NavBarItem
        key={o.value}
        {...o}
        selected={o.value === selectedValue}
        onLayout={handleLayout(o.value)}
        onPress={handlePress(o.value)}
        onLongPress={handleLongPress(o.value)}
        hitSlop={hitSlop}
      />
    ))
  }, [
    handleLayout,
    handleLongPress,
    handlePress,
    hitSlop,
    navBarOptions,
    selectedValue,
  ])

  return (
    <Box
      {...containerProps}
      paddingHorizontal="2xl"
      flexDirection="row"
      flex={1}
      shadowColor="base.black"
      shadowOpacity={0.3}
      shadowOffset={{ width: 0, height: 6 }}
      shadowRadius={6}
    >
      <Box
        flexDirection="row"
        justifyContent="space-between"
        backgroundColor="primaryText"
        borderRadius="full"
        padding="md"
        flex={1}
        gap="2"
      >
        {items}
      </Box>
    </Box>
  )
}