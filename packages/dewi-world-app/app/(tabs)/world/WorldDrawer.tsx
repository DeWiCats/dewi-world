import FeatureImageSlide from '@/components/FeatureImageSlide';
import LocationDetail from '@/components/LocationDetail';
import LocationsList from '@/components/LocationsList';
import { ReAnimatedBox } from '@/components/ui/Box';
import { Theme } from '@/constants/theme';
import { GeoJSONFeature } from '@/geojson';
import { useColors } from '@/hooks/theme';
import { wh, ww } from '@/utils/layout';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '@shopify/restyle';
import { useEffect, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type WorldDrawerProps = {
  locations: GeoJSONFeature[];
  selectedLocation?: null | GeoJSONFeature;
  fadeIn: boolean;
  animationDelay: number;
  onClose?: () => void;
  onSelect?: (location: GeoJSONFeature) => void;
};

export default function WorldDrawer({
  locations,
  selectedLocation,
  fadeIn,
  animationDelay,
  onClose = () => {},
  onSelect = () => {},
}: WorldDrawerProps) {
  const { bottom } = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const colors = useColors();
  const { borderRadii } = useTheme<Theme>();
  const [panningEnabled, setPanningEnabled] = useState(false);

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

  const fadeInStyle = useAnimatedStyle(() => {
    if (fadeIn) {
      return {
        opacity: withTiming(1, { duration: animationDelay }),
      };
    }

    return {
      opacity: withTiming(0, { duration: animationDelay }),
    };
  }, [fadeIn]);

  useEffect(() => {
    if (selectedLocation) {
      bottomSheetRef.current?.snapToIndex(1);
    }
  }, [selectedLocation]);

  return (
    <>
      <ReAnimatedBox style={fadeInStyle} position={'absolute'} height={ww}>
        {selectedLocation && <FeatureImageSlide location={selectedLocation} imageSize={ww} />}
      </ReAnimatedBox>
      <BottomSheet
        enableHandlePanningGesture={panningEnabled}
        bottomInset={bottom}
        snapPoints={[150, wh - ww + 20, wh - 110]}
        index={0}
        onAnimate={animateHandler}
        role="alert"
        ref={bottomSheetRef}
        maxDynamicContentSize={wh - 110}
        handleIndicatorStyle={{ backgroundColor: colors['gray.700'] }}
        backgroundStyle={{
          backgroundColor: colors['primaryBackground'],
          borderTopRightRadius: borderRadii.full,
          borderTopLeftRadius: borderRadii.full,
        }}
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
            alignItems: 'center',
            height: wh - 110,
          }}
        >
          <ReAnimatedBox
            style={fadeInStyle}
            alignItems={'center'}
            flex={1}
            width={'100%'}
            height="100%"
          >
            {selectedLocation ? (
              <LocationDetail location={selectedLocation} />
            ) : (
              <LocationsList onSelect={onSelect} locations={locations} />
            )}
          </ReAnimatedBox>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
