import CustomBottomSheet from '@/components/CustomBottomSheet';
import ImageSlide from '@/components/ImageSlide';
import { hardwareIconMap } from '@/components/LocationCard';
import LocationDetail from '@/components/LocationDetail';
import LocationsHeader from '@/components/LocationsHeader';
import { GeoJSONFeature } from '@/geojson';
import { wh, ww } from '@/utils/layout';
import { LocationPost } from '@/utils/mockLocations';
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
      <CustomBottomSheet sheetProps={{ snapPoints: [wh - (ww + 90), wh - ww + 20, wh - 110] }}>
        <LocationDetail location={feature} />
      </CustomBottomSheet>
    </>
  );
}
