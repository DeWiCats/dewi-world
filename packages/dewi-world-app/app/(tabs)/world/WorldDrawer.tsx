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
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type WorldDrawerProps = {
  locations: GeoJSONFeature[];
  selectedLocation?: null | GeoJSONFeature;
  onClose?: () => void;
  onSelect?: (location: GeoJSONFeature) => void;
};

export default function WorldDrawer({
  locations,
  selectedLocation,
  onClose = () => {},
  onSelect = () => {},
}: WorldDrawerProps) {
  const { bottom } = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const animationDelay = 600;
  const imageSize = ww;

  const colors = useColors();
  const { borderRadii } = useTheme<Theme>();

  const [isExpanded, setIsExpanded] = useState(false);

  const animateHandler = (_: number, toIndex: number) => {
    if (toIndex === 0) {
      setIsExpanded(false);
      setTimeout(onClose, animationDelay);
    }
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
      bottomSheetRef.current?.snapToIndex(1);
      setIsExpanded(true);
    }
  }, [selectedLocation]);

  return (
    <>
      <ReAnimatedBox style={style} position={'absolute'} height={imageSize}>
        {selectedLocation && (
          <FeatureImageSlide location={selectedLocation} imageSize={imageSize} />
        )}
      </ReAnimatedBox>
      <BottomSheet
        bottomInset={bottom}
        snapPoints={[100, wh - ww + 20, wh - 110]}
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
          {selectedLocation ? (
            <LocationDetail location={selectedLocation} />
          ) : (
            <LocationsList onSelect={onSelect} locations={locations} />
          )}
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
