import CustomBottomSheet from '@/components/CustomBottomSheet';
import ImageSlide from '@/components/ImageSlide';
import LocationDetail from '@/components/LocationDetail';
import LocationsHeader from '@/components/LocationsHeader';
import PriceAndMessageBox from '@/components/PriceAndMessageBox';
import { GeoJSONLocation } from '@/lib/geojsonAPI';
import { wh, ww } from '@/utils/layout';
import { LocationPost } from '@/utils/mockLocations';
import { useMemo } from 'react';

interface DetailScreenProps {
  onExit: () => void;
  location: LocationPost;
}

export default function DetailScreen({ onExit, location }: DetailScreenProps) {
  const mapLocationPostToGeoJson = (location: LocationPost) => {
    return {
      geometry: { type: 'Point', coordinates: [0, 0] },
      type: 'Feature',
      properties: {
        address: location.address,
        deployable_hardware: location.deployable_hardware,
        description: location.description,
        gallery: location.gallery,
        id: location.id,
        is_negotiable: location.is_negotiable,
        name: location.title,
        price: location.price,
        created_at: location.created_at,
        distance: location.distance,
        rating: location.rating,
        owner_id: location.owner_id,
      },
    } as GeoJSONLocation;
  };

  const geoJson = useMemo(() => mapLocationPostToGeoJson(location), [location]);

  return (
    <>
      <LocationsHeader onExit={onExit} onLike={() => {}} />
      <ImageSlide imageSize={ww} srcURIs={location.gallery} />
      <CustomBottomSheet sheetProps={{ snapPoints: [wh - ww + 70, wh - 80] }}>
        <LocationDetail location={geoJson} />
      </CustomBottomSheet>
      <PriceAndMessageBox location={geoJson} />
    </>
  );
}
