import CustomBottomSheet from '@/components/CustomBottomSheet';
import ImageSlide from '@/components/ImageSlide';
import LocationDetail from '@/components/LocationDetail';
import LocationsHeader from '@/components/LocationsHeader';
import PriceAndMessageBox from '@/components/PriceAndMessageBox';
import { ServiceSheetStackNavigationProp } from '@/components/ServiceSheetLayout';
import { useConversations } from '@/hooks/useMessages';
import { GeoJSONLocation } from '@/lib/geojsonAPI';
import { wh, ww } from '@/utils/layout';
import { LocationPost } from '@/utils/mockLocations';
import { CreateConversationRequest } from '@/utils/mockMessaging';
import { useNavigation } from 'expo-router';
import { useMemo } from 'react';

interface DetailScreenProps {
  location: LocationPost;
  onExit: () => void;
}

export default function DetailScreen({ location, onExit }: DetailScreenProps) {
  const nav = useNavigation<ServiceSheetStackNavigationProp>();
  const { createConversation } = useConversations();

  const messageOwnerHandler = async () => {
    try {
      console.log('Attempting to message owner...');

      const request: CreateConversationRequest = {
        receiver_id: location.owner_id,
        location_id: location.id,
        initial_message:
          "Hello, I'm interested in your location post at " +
          location.address +
          ". Happy to chat if the timing's right!",
      };

      const response = await createConversation(request);

      console.log('Successfully created the following conversation:', response);

      nav.navigate('ChatTab');
      onExit();
    } catch (error) {
      console.error('Error while trying to message location owner:', error);
    }
  };

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
      },
    } as GeoJSONLocation;
  };

  const geoJson = useMemo(() => mapLocationPostToGeoJson(location), [location]);

  return (
    <>
      <LocationsHeader paddingTop="7xl" onExit={onExit} onLike={() => {}} />
      <ImageSlide imageSize={ww} srcURIs={location.gallery} />
      <CustomBottomSheet sheetProps={{ snapPoints: [wh - ww + 70, wh - 80] }}>
        <LocationDetail location={geoJson} />
      </CustomBottomSheet>
      <PriceAndMessageBox
        isNegotiable={location.is_negotiable}
        price={location.price}
        onMessageOwner={messageOwnerHandler}
      />
    </>
  );
}
