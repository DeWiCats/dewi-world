import Box, { ReAnimatedBox } from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { Theme } from '@/constants/theme';
import { GeoJSONFeature } from '@/geojson';
import { useColors } from '@/hooks/theme';
import { wh, ww } from '@/utils/layout';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '@shopify/restyle';
import { useEffect, useRef, useState } from 'react';
import { Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type WorldDrawerProps = {
  selectedLocation?: null | GeoJSONFeature;
  onClose?: () => void;
};

export default function WorldDrawer({ selectedLocation, onClose = () => {} }: WorldDrawerProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const animationDelay = 600;
  const imageSize = ww;

  const colors = useColors();
  const { borderRadii } = useTheme<Theme>();

  const [isExpanded, setIsExpanded] = useState(false);

  const closeHandler = () => {
    setIsExpanded(false);
    setTimeout(onClose, animationDelay);
  };

  const style = useAnimatedStyle(() => {
    if (isExpanded) {
      return {
        opacity: withTiming(1, { duration: animationDelay }),
      };
    }

    return {
      opacity: withTiming(0, { duration: animationDelay }),
    };
  }, [isExpanded]);

  useEffect(() => {
    if (selectedLocation) {
      bottomSheetRef.current?.snapToIndex(0);
      setIsExpanded(true);
    }
  }, [selectedLocation]);

  return (
    <>
      <ReAnimatedBox style={style} position={'absolute'} height={imageSize + 20}>
        {selectedLocation && (
          <ScrollView horizontal>
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
        )}
      </ReAnimatedBox>
      <BottomSheet
        snapPoints={[ww + 20, wh]}
        index={-1}
        enablePanDownToClose
        role="alert"
        onClose={closeHandler}
        ref={bottomSheetRef}
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
            height: wh,
          }}
        >
          {selectedLocation && (
            <Box>
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
