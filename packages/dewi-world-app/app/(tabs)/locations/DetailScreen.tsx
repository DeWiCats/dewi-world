import CustomBottomSheet from '@/components/CustomBottomSheet';
import ImageSlide from '@/components/ImageSlide';
import { hardwareIconMap } from '@/components/LocationCard';
import LocationDetail from '@/components/LocationDetail';
import LocationsHeader from '@/components/LocationsHeader';
import PriceAndMessageBox from '@/components/PriceAndMessageBox';
import { ServiceSheetStackNavigationProp } from '@/components/ServiceSheetLayout';
import { GeoJSONFeature } from '@/geojson';
import { useConversations } from '@/hooks/useMessages';
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

  const mapLocationToLegacyFeature = (location: LocationPost) => {
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
        owner_id: location.owner_id,
        distance: location.distance,
        deployment_cost: location.price.toString(),
        photos: location.gallery,
        extras: [],
        is_negotiable: location.is_negotiable,
      },
    };
    return feature;
  };

  const feature = useMemo(() => mapLocationToLegacyFeature(location), [location]);

  return (
    <>
      <LocationsHeader paddingTop="7xl" onExit={onExit} onLike={() => {}} />
      <ImageSlide imageSize={ww} srcURIs={location.gallery} />
      <CustomBottomSheet sheetProps={{ snapPoints: [wh - ww + 20, wh - 110] }}>
        <LocationDetail location={feature} />
      </CustomBottomSheet>
      <PriceAndMessageBox
        isNegotiable={location.is_negotiable}
        price={location.price}
        onMessageOwner={messageOwnerHandler}
      />
    </>
  );
}
