import Text from "@/components/ui/Text";
import { Theme } from "@/constants/theme";
import { GeoJSONFeature } from "@/geojson";
import { useColors } from "@/hooks/theme";
import { wh } from "@/utils/layout";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { useCallback, useEffect, useMemo, useRef } from "react";

type WorldDrawerProps = {
  selectedLocation?: null | GeoJSONFeature;
  onClose?: () => void;
};

export default function WorldDrawer({
  selectedLocation,
  onClose = () => {},
}: WorldDrawerProps) {
  const height = wh / 1.5;

  const isExpanded = useMemo(() => !!selectedLocation, [selectedLocation]);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const colors = useColors();
  const { borderRadii } = useTheme<Theme>();

  useEffect(() => {
    if (isExpanded) bottomSheetRef.current?.expand();
    else bottomSheetRef.current?.close();
  }, [isExpanded]);

  // callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log("handleSheetChanges", index);
    },
    [bottomSheetRef]
  );

  return (
    <>
      <BottomSheet
        enablePanDownToClose
        role="alert"
        onClose={onClose}
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        handleIndicatorStyle={{ backgroundColor: colors["gray.700"] }}
        handleStyle={{
          backgroundColor: colors["primaryBackground"],
          borderTopRightRadius: borderRadii.full,
          borderTopLeftRadius: borderRadii.full,
        }}
      >
        <BottomSheetView
          style={{
            backgroundColor: colors["primaryBackground"],
            flex: 1,
            padding: 36,
            alignItems: "center",
            height,
          }}
        >
          <Text variant={"displayXsLight"} color="text.white">
            {JSON.stringify(selectedLocation)}
          </Text>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
