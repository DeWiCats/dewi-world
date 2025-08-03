import CustomBottomSheet from '@/components/CustomBottomSheet';
import ImageSlide from '@/components/ImageSlide';
import LocationDetail from '@/components/LocationDetail';
import LocationsList from '@/components/LocationsList';
import { ReAnimatedBox } from '@/components/ui/Box';
import { GeoJSONFeature } from '@/geojson';
import { useSpacing } from '@/hooks/theme';
import { ww } from '@/utils/layout';
import BottomSheet from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, StyleProp, ViewStyle } from 'react-native';
import { AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type WorldDrawerProps = {
  locations: GeoJSONFeature[];
  selectedLocation?: null | GeoJSONFeature;
  style: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  onClose?: () => void;
  onSelect?: (location: GeoJSONFeature) => void;
};

export default function WorldDrawer({
  locations,
  selectedLocation,
  style,
  onClose = () => {},
  onSelect = () => {},
}: WorldDrawerProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [panningEnabled, setPanningEnabled] = useState(false);
  const { bottom } = useSafeAreaInsets();
  const spacing = useSpacing();

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => {
      setPanningEnabled(false);
      bottomSheetRef.current?.snapToIndex(1);
    });
    Keyboard.addListener('keyboardDidHide', () => {
      setPanningEnabled(true);
    });
    return () => {
      Keyboard.removeAllListeners('keyboardDidShow');
      Keyboard.removeAllListeners('keyboardDidHide');
    };
  }, []);

  const animateHandler = (fromIndex: number, toIndex: number) => {
    if (fromIndex === 0) return;
    if (toIndex === 0 && selectedLocation) {
      onClose();
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      bottomSheetRef.current?.snapToIndex(1);
    }
  }, [selectedLocation]);

  return (
    <>
      <ReAnimatedBox style={style} position={'absolute'} height={ww}>
        {selectedLocation && (
          <ImageSlide srcImports={selectedLocation.properties.photos} imageSize={ww} />
        )}
      </ReAnimatedBox>
      <CustomBottomSheet
        sheetProps={{
          onAnimate: animateHandler,
          enableHandlePanningGesture: panningEnabled,
          containerStyle: {
            marginBottom: bottom,
          },
        }}
        ref={bottomSheetRef}
      >
        <ReAnimatedBox style={style} alignItems={'center'} flex={1} width={'100%'} height="100%">
          {selectedLocation ? (
            <LocationDetail location={selectedLocation} />
          ) : (
            <LocationsList onSelect={onSelect} locations={locations} />
          )}
        </ReAnimatedBox>
      </CustomBottomSheet>
    </>
  );
}
