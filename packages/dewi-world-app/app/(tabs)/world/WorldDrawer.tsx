import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { Theme } from '@/constants/theme';
import { GeoJSONFeature } from '@/geojson';
import { useColors } from '@/hooks/theme';
import { wh } from '@/utils/layout';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '@shopify/restyle';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type WorldDrawerProps = {
  selectedLocation?: null | GeoJSONFeature;
  onClose?: () => void;
};

export default function WorldDrawer({ selectedLocation, onClose = () => {} }: WorldDrawerProps) {
  const { top } = useSafeAreaInsets();
  const height = wh - top;

  const isExpanded = useMemo(() => !!selectedLocation, [selectedLocation]);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const imageSize = 200;

  const colors = useColors();
  const { borderRadii } = useTheme<Theme>();

  useEffect(() => {
    if (isExpanded) bottomSheetRef.current?.expand();
    else bottomSheetRef.current?.close();
  }, [isExpanded]);

  // callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log('handleSheetChanges', index);
    },
    [bottomSheetRef]
  );

  return (
    <>
      <BottomSheet
        snapPoints={[wh / 4, wh / 1.5, wh - top]}
        index={-1}
        enablePanDownToClose
        role="alert"
        onClose={onClose}
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        handleIndicatorStyle={{ backgroundColor: colors['gray.700'] }}
        handleStyle={{
          backgroundColor: colors['primaryBackground'],
          borderTopRightRadius: borderRadii.full,
          borderTopLeftRadius: borderRadii.full,
        }}
      >
        <BottomSheetView
          style={{
            backgroundColor: colors['primaryBackground'],
            flex: 1,
            padding: 36,
            alignItems: 'center',
            height,
          }}
        >
          {selectedLocation && (
            <Box>
              <ScrollView horizontal style={{ maxHeight: imageSize + 20 }}>
                {selectedLocation.properties.photos.map((photo, i) => (
                  <Image
                    key={selectedLocation.properties.address + i}
                    width={imageSize}
                    height={imageSize}
                    source={photo}
                    style={{ width: imageSize, height: imageSize }}
                  ></Image>
                ))}
              </ScrollView>
              <Text variant={'textXsLight'} color="text.white">
                {selectedLocation.properties.address}
              </Text>
              <Text variant={'textXsLight'} color="text.white">
                Description
              </Text>
              <Text variant={'textXsLight'} color="text.white">
                {selectedLocation.properties.description}
              </Text>
              <Text variant="textXsLight" color="text.white">
                {selectedLocation.properties.extras.join(', ')}
              </Text>
              <Text variant="textXsLight" color="text.white">
                Deployable Hardware
              </Text>
              {selectedLocation.properties.depin_hardware.map(({ name, Icon }) => (
                <Box flexDirection="row" key={name + selectedLocation.properties.name}>
                  <Text variant="textXsLight" color="text.white">
                    {name}
                  </Text>
                </Box>
              ))}
            </Box>
          )}
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
