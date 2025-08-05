import CustomBottomSheet from '@/components/CustomBottomSheet';
import ImageSlide from '@/components/ImageSlide';
import LocationDetail from '@/components/LocationDetail';
import LocationsList from '@/components/LocationsList';
import PriceAndMessageBox from '@/components/PriceAndMessageBox';
import { ReAnimatedBox } from '@/components/ui/Box';
import { useConversations } from '@/hooks/useMessages';
import { GeoJSONLocation } from '@/lib/geojsonAPI';
import { ww } from '@/utils/layout';
import { CreateConversationRequest } from '@/utils/mockMessaging';
import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, StyleProp, ViewStyle } from 'react-native';
import { AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatStackNavigationProp } from '../chat/ChatNavigator';

type WorldDrawerProps = {
  locations: GeoJSONLocation[];
  selectedLocation?: null | GeoJSONLocation;
  style: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  onClose?: () => void;
  onSelect?: (location: GeoJSONLocation) => void;
};

export default function WorldDrawer({
  locations,
  selectedLocation,
  style,
  onClose = () => {},
  onSelect = () => {},
}: WorldDrawerProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [panningEnabled, setPanningEnabled] = useState(true);
  const { bottom } = useSafeAreaInsets();

  const nav = useNavigation<ChatStackNavigationProp>();
  const router = useRouter();
  const { createConversation } = useConversations();

  const messageOwnerHandler = async (location: GeoJSONLocation) => {
    try {
      console.log('Attempting to message owner...');

      const request: CreateConversationRequest = {
        receiver_id: location.properties.owner_id,
        location_id: location.properties.id,
        initial_message:
          "Hello, I'm interested in your location post at " +
          location.properties.address +
          ". Happy to chat if the timing's right!",
      };

      const response = await createConversation(request);

      console.log('Successfully created the following conversation:', response);

      //TODO fix
      // nav.push('chat/index', { conversationId: response.id });
      router.push({
        pathname: '/(tabs)/chat',
        params: { conversationId: response.id },
      });

      onClose();
    } catch (error) {
      console.error('Error while trying to message location owner:', error);
    }
  };

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
          <ImageSlide srcURIs={selectedLocation.properties.gallery} imageSize={ww} />
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

      {selectedLocation && (
        <PriceAndMessageBox
          style={{ paddingBottom: bottom, paddingTop: 20 }}
          isNegotiable={selectedLocation.properties.is_negotiable}
          price={selectedLocation.properties.price}
          onMessageOwner={() => messageOwnerHandler(selectedLocation)}
        />
      )}
    </>
  );
}
