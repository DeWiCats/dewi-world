import ButtonPressable from '@/components/ButtonPressable';
import CustomBottomSheet from '@/components/CustomBottomSheet';
import ImageSlide from '@/components/ImageSlide';
import { hardwareIconMap } from '@/components/LocationCard';
import LocationDetail from '@/components/LocationDetail';
import LocationsHeader from '@/components/LocationsHeader';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { GeoJSONFeature } from '@/geojson';
import { wh, ww } from '@/utils/layout';
import { LocationPost } from '@/utils/mockLocations';
import { Link } from 'expo-router';
import { useMemo } from 'react';

interface DetailScreenProps {
  location: LocationPost;
  onExit: () => void;
}

export default function DetailScreen({ location, onExit }: DetailScreenProps) {
  const mapLocationToFeature = (location: LocationPost) => {
    const feature: GeoJSONFeature = {
      type: 'Feature',
      geometry: { coordinates: [0, 0], type: 'Point' },
      properties: {
        name: location.title,
        address: location.address,
        description: location.description,
        depin_hardware: location.deployable_hardware.slice(0, 5).map(hardware => ({
          name: hardware,
          Icon: hardwareIconMap[hardware as keyof typeof hardwareIconMap],
        })),
        deployment_cost: location.price.toString(),
        photos: location.gallery,
        extras: [],
      },
    };
    return feature;
  };

  const feature = useMemo(() => mapLocationToFeature(location), [location]);

  return (
    <>
      <LocationsHeader onExit={onExit} onLike={() => {}} />
      <ImageSlide imageSize={ww} srcURIs={location.gallery} />
      <CustomBottomSheet sheetProps={{ snapPoints: [wh - (ww + 90), wh - 110] }}>
        <LocationDetail location={feature} />
      </CustomBottomSheet>
      <Box
        backgroundColor={'primaryBackground'}
        borderTopWidth={1}
        borderTopColor={'gray.700'}
        paddingHorizontal="3xl"
        paddingVertical="5xl"
        flexDirection="row"
        width="100%"
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Text variant="textXlBold" color="text.white">
          $ {location.price}
        </Text>
        <Link
          href={{
            pathname: '/(tabs)/chat',
          }}
        >
          <ButtonPressable
            fontSize={16}
            innerContainerProps={{ padding: 'xl' }}
            title="Message Owner"
            backgroundColor={'pink.500'}
            backgroundColorPressed="pink.400"
          />
        </Link>
      </Box>
    </>
  );
}
