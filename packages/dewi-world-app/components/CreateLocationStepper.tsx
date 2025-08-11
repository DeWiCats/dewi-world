import MobileWalletAdapterButton from '@/components/MobileWalletAdapterButton';
import PlaceAutocomplete from '@/components/PlaceAutocomplete';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { useLocations } from '@/hooks/useLocations';
import { CreateLocationRequest } from '@/lib/api';
import { pickImages, uploadMultipleImages } from '@/lib/imageUpload';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, Switch, TextInput } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Import hardware icons and Solana functionality
import { useStepperStore } from '@/stores/useStepperStore';
import { wh } from '@/utils/layout';
import Icon5G from '@assets/svgs/5g-logo.svg';
import IconAir from '@assets/svgs/air-logo.svg';
import IconHelium from '@assets/svgs/helium-logo.svg';
import IconLorawan from '@assets/svgs/lorawan-logo.svg';
import IconMarine from '@assets/svgs/marine-logo.svg';
import IconWeather from '@assets/svgs/weather-logo.svg';
import IconWifi from '@assets/svgs/wifi-logo.svg';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomBottomSheet from './CustomBottomSheet';

const hardwareOptions = [
  { id: '5g', name: '5G', Icon: Icon5G },
  { id: 'helium', name: 'Helium', Icon: IconHelium },
  { id: 'wifi', name: 'WiFi', Icon: IconWifi },
  { id: 'lorawan', name: 'LoRaWAN', Icon: IconLorawan },
  { id: 'weather', name: 'Weather', Icon: IconWeather },
  { id: 'air', name: 'Air Quality', Icon: IconAir },
  { id: 'marine', name: 'Marine', Icon: IconMarine },
];

// Solana configuration
const RECIPIENT_ADDRESS = 'nipBsDsozuLnFZ4uKRMprsEsbi7WtQcRJu8NZZogPnJ'; // Valid base58 Solana address (System Program)
const PAYMENT_AMOUNT_SOL = 0.1;

const APP_IDENTITY = {
  name: 'DeWiWorld',
  uri: 'https://dewicats.com',
  icon: '/favicon.ico',
};

interface StepperProps {
  onComplete: () => void;
  visible: boolean;
}

export default function CreateLocationStepper({ onComplete, visible }: StepperProps) {
  const { createLocation, refreshLocations } = useLocations();
  const { hideStepper } = useStepperStore();

  const onCompleteHandler = () => {
    // reset stepper
    setCurrentStep(0);
    setFormData({
      title: '',
      description: '',
      formatted_address: '',
      latitude: undefined,
      longitude: undefined,
      place_id: '',
      price: '',
      is_negotiable: true,
      deployable_hardware: [],
      gallery: [],
    });
    setPaymentStatus('pending');
    setTransactionSignature(null);
    onComplete();
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    'pending' | 'processing' | 'completed' | 'failed'
  >('pending');
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    formatted_address: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    place_id: '',
    price: '',
    is_negotiable: true,
    deployable_hardware: [] as string[],
    gallery: [] as string[],
  });

  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 });

  // Animation values
  const slideX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const steps = [
    {
      title: 'What is your location called?',
      subtitle: 'Give your location a memorable name that hosts will recognize',
      icon: '📍',
    },
    {
      title: 'Where is it located?',
      subtitle: 'Help us find your exact address for accurate mapping',
      icon: '🗺️',
    },
    {
      title: 'Tell us more about it',
      subtitle: 'Share details that will help hosts understand what makes your location special',
      icon: '✨',
    },
    {
      title: 'Set your pricing',
      subtitle: 'Choose a competitive rate for your hosting services',
      icon: '💰',
    },
    {
      title: 'What can be deployed?',
      subtitle: 'Select the types of hardware your location can support',
      icon: '🔧',
    },
    {
      title: 'Add some photos',
      subtitle: 'Show off your location with high-quality images',
      icon: '📸',
    },
    {
      title: 'Connect & pay to create location',
      subtitle: `Pay ${PAYMENT_AMOUNT_SOL} SOL to publish your location and make it discoverable`,
      icon: '💳',
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      slideX.value = withTiming(-100, { duration: 300 }, finished => {
        if (finished) {
          runOnJS(setCurrentStep)(nextStepIndex);
          slideX.value = 100;
          slideX.value = withSpring(0, { damping: 20, stiffness: 200 });
        }
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      slideX.value = withTiming(100, { duration: 300 }, finished => {
        if (finished) {
          runOnJS(setCurrentStep)(prevStepIndex);
          slideX.value = -100;
          slideX.value = withSpring(0, { damping: 20, stiffness: 200 });
        }
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.title.trim().length > 0;
      case 1:
        return formData.formatted_address.trim().length > 0;
      case 2:
        return true; // Description is optional
      case 3:
        return formData.price && Number(formData.price) > 0;
      case 4:
        return formData.deployable_hardware.length > 0;
      case 5:
        return selectedImages.length > 0;
      case 6:
        return paymentStatus === 'completed';
      default:
        return false;
    }
  };

  const handlePaymentSuccess = async (signature: string) => {
    setTransactionSignature(signature);
    setPaymentStatus('processing');

    // Show a brief success message before creating location
    setTimeout(async () => {
      setPaymentStatus('completed');
      await createLocationAfterPayment();
    }, 1500);
  };

  const handlePaymentFailure = (error: string) => {
    setPaymentStatus('failed');
    console.error('Payment failed:', error);
  };

  const createLocationAfterPayment = async () => {
    try {
      setLoading(true);

      // Upload images
      const uploadResult = await uploadMultipleImages(
        selectedImages,
        'locations',
        (completed, total) => setUploadProgress({ completed, total })
      );

      if (!uploadResult.success || uploadResult.urls.length === 0) {
        Alert.alert('Error', 'Failed to upload images. Please try again.');
        return;
      }

      const locationData: CreateLocationRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        address: formData.formatted_address.trim(),
        formatted_address: formData.formatted_address.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        place_id: formData.place_id,
        price: Number(formData.price),
        is_negotiable: formData.is_negotiable,
        deployable_hardware: formData.deployable_hardware,
        gallery: uploadResult.urls,
      };

      await createLocation(locationData);
      await refreshLocations();

      Alert.alert(
        'Location Created Successfully!',
        'Your location has been published and is now discoverable by hosts.',
        [
          {
            text: 'Great!',
            onPress: () => {
              // Success animation and callback
              opacity.value = withTiming(0, { duration: 500 }, finished => {
                if (finished) {
                  runOnJS(onCompleteHandler)();
                }
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create location');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
      setUploadProgress({ completed: 0, total: 0 });
    }
  };

  const handleFinish = async () => {
    if (!canProceed()) return;

    // For the payment step, the MobileWalletAdapterButton handles the payment
    // and calls handlePaymentSuccess which automatically creates the location
    if (currentStep === 6) {
      // Payment is handled by the MobileWalletAdapterButton
      return;
    }

    // Continue to next step for other steps
    nextStep();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: opacity.value,
  }));

  const renderProgressBar = () => (
    <Box flexDirection="row" alignItems="center" marginBottom="6" paddingHorizontal="4">
      {steps.map((_, index) => (
        <Box key={index} flex={1} marginHorizontal="1">
          <Box
            height={4}
            borderRadius="xs"
            backgroundColor={index <= currentStep ? 'base.white' : 'inputBackground'}
            style={{
              opacity: index <= currentStep ? 1 : 0.3,
            }}
          />
        </Box>
      ))}
    </Box>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <TitleStep
            value={formData.title}
            onChange={title => setFormData(prev => ({ ...prev, title }))}
          />
        );
      case 1:
        return (
          <LocationStep
            onPlaceSelected={place => {
              console.log('selected place', place);
              setFormData(prev => ({
                ...prev,
                formatted_address: place.description,
                place_id: place.placeId,
                latitude: place.coordinates?.latitude,
                longitude: place.coordinates?.longitude,
              }));
            }}
            selectedAddress={formData.formatted_address}
          />
        );
      case 2:
        return (
          <DescriptionStep
            value={formData.description}
            onChange={description => setFormData(prev => ({ ...prev, description }))}
          />
        );
      case 3:
        return (
          <PricingStep
            price={formData.price}
            isNegotiable={formData.is_negotiable}
            onPriceChange={price => setFormData(prev => ({ ...prev, price }))}
            onNegotiableChange={negotiable =>
              setFormData(prev => ({ ...prev, is_negotiable: negotiable }))
            }
          />
        );
      case 4:
        return (
          <HardwareStep
            selectedHardware={formData.deployable_hardware}
            onSelectionChange={hardware =>
              setFormData(prev => ({ ...prev, deployable_hardware: hardware }))
            }
          />
        );
      case 5:
        return (
          <PhotosStep
            selectedImages={selectedImages}
            onImagesChange={setSelectedImages}
            uploadProgress={uploadProgress}
            isLoading={loading}
          />
        );
      case 6:
        return (
          <PaymentStep
            paymentStatus={paymentStatus}
            transactionSignature={transactionSignature}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailure={handlePaymentFailure}
            isLoading={loading}
            amount={PAYMENT_AMOUNT_SOL}
            recipientAddress={RECIPIENT_ADDRESS}
          />
        );
      default:
        return null;
    }
  };

  const onExit = async () => {
    // reset stepper
    setCurrentStep(0);
    setFormData({
      title: '',
      description: '',
      formatted_address: '',
      latitude: undefined,
      longitude: undefined,
      place_id: '',
      price: '',
      is_negotiable: true,
      deployable_hardware: [],
      gallery: [],
    });
    bottomSheet.current?.forceClose({ duration: 300 });

    // Give time for the closing animation to complete before hiding the stepper
    setTimeout(hideStepper, 400);
  };

  const { bottom } = useSafeAreaInsets();

  const bottomSheet = useRef<null | BottomSheet>(null);

  // We should be able to control visibility using only the bottom sheet
  // However removing this line of code causes an infinite render loop
  // So for now just leave it as a TODO
  if (!visible) return null;

  return (
    <Portal>
      <CustomBottomSheet
        ref={bottomSheet}
        sheetViewProps={{
          style: {
            height: wh,
          },
        }}
        sheetProps={{
          maxDynamicContentSize: wh,
          backdropComponent: props => (
            <BottomSheetBackdrop {...props} style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
          ),
          snapPoints: [wh],
        }}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="primaryBackground"
          zIndex={9999}
          style={{
            elevation: 1000, // For Android
          }}
        >
          {/* Header */}
          <Box paddingTop="4xl" paddingHorizontal="4" paddingBottom="4">
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              marginBottom="4"
            >
              <Pressable onPress={() => (currentStep > 0 ? prevStep() : onExit())}>
                <Text variant="textMdRegular" color="base.white">
                  {currentStep > 0 ? '← Back' : '✕ Cancel'}
                </Text>
              </Pressable>
              <Text variant="textMdMedium" color="secondaryText">
                {currentStep + 1} of {steps.length}
              </Text>
            </Box>

            {renderProgressBar()}
          </Box>

          {/* Content */}
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Step Header */}
              <Box alignItems="center" marginBottom="6">
                <Text style={{ fontSize: 60 }} marginBottom="4">
                  {steps[currentStep].icon}
                </Text>
                <Text variant="textXlBold" color="primaryText" textAlign="center" marginBottom="2">
                  {steps[currentStep].title}
                </Text>
                <Text variant="textMdRegular" color="secondaryText" textAlign="center">
                  {steps[currentStep].subtitle}
                </Text>
              </Box>

              {renderStepContent()}
            </ScrollView>
          </Animated.View>

          {/* Bottom Button */}
          <Box
            paddingHorizontal="4"
            paddingBottom="8"
            paddingTop="4"
            backgroundColor="primaryBackground"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            {/* Hide the bottom button on payment step since MobileWalletAdapterButton handles it */}
            {currentStep !== 6 && (
              <Pressable
                onPress={handleFinish}
                disabled={!canProceed() || loading}
                style={({ pressed }) => ({
                  backgroundColor: canProceed() && !loading ? 'white' : '#555',
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 500,
                  opacity: pressed ? 0.8 : 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 8,
                  marginBottom: bottom,
                })}
              >
                <Text variant="textLgBold" color="primaryBackground" textAlign="center">
                  {loading ? 'Processing...' : 'Continue'}
                </Text>
              </Pressable>
            )}
          </Box>
        </Box>
      </CustomBottomSheet>
    </Portal>
  );
}

// Individual Step Components
const TitleStep = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [initialRender, setInitialRender] = useState(true);

  // Prevent keyboard from showing up on initial render
  useEffect(() => {
    const timeout = setTimeout(() => setInitialRender(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Box>
      <Box
        backgroundColor="inputBackground"
        borderRadius="xl"
        paddingHorizontal="4"
        paddingVertical="4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <TextInput
          showSoftInputOnFocus={!initialRender}
          placeholder="e.g., Downtown Office with Rooftop Access"
          placeholderTextColor="#888"
          value={value}
          onChangeText={onChange}
          style={{
            fontSize: 18,
            color: '#ffffff',
            fontFamily: 'Figtree',
            textAlign: 'center',
          }}
          maxLength={200}
          autoFocus
          returnKeyType="next"
        />
      </Box>
      <Text variant="textSmRegular" color="secondaryText" textAlign="center" marginTop="3">
        Make it descriptive and memorable
      </Text>
    </Box>
  );
};

const LocationStep = ({
  onPlaceSelected,
  selectedAddress,
}: {
  onPlaceSelected: (place: any) => void;
  selectedAddress: string;
}) => (
  <Box>
    <PlaceAutocomplete onPlaceSelected={onPlaceSelected} />
    {selectedAddress && (
      <Box marginTop="4" padding="4" backgroundColor="green.100" borderRadius="xl">
        <Text variant="textMdRegular" color="green.500" textAlign="center">
          ✓ {selectedAddress}
        </Text>
      </Box>
    )}
  </Box>
);

const DescriptionStep = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <Box>
    <Box
      backgroundColor="inputBackground"
      borderRadius="xl"
      paddingHorizontal="4"
      paddingVertical="4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <TextInput
        placeholder="• Power availability and reliability&#10;• Internet connection details&#10;• Access instructions and hours&#10;• View, height, and coverage area&#10;• Special features or amenities"
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChange}
        style={{
          fontSize: 16,
          color: '#ffffff',
          fontFamily: 'Figtree',
          minHeight: 120,
          textAlignVertical: 'top',
        }}
        multiline
        maxLength={2000}
        autoFocus
      />
    </Box>
    <Text variant="textSmRegular" color="secondaryText" textAlign="center" marginTop="3">
      This step is optional, but helpful for hosts
    </Text>
  </Box>
);

const PricingStep = ({
  price,
  isNegotiable,
  onPriceChange,
  onNegotiableChange,
}: {
  price: string;
  isNegotiable: boolean;
  onPriceChange: (price: string) => void;
  onNegotiableChange: (negotiable: boolean) => void;
}) => (
  <Box>
    {/* Cash App Style Price Input */}
    <Box alignItems="center" marginBottom="6">
      <Box flexDirection="row" alignItems="center">
        <Text variant="textXlBold" color="primaryText" style={{ fontSize: 40 }}>
          $
        </Text>
        <TextInput
          placeholder="0"
          placeholderTextColor="#888"
          value={price}
          onChangeText={onPriceChange}
          style={{
            fontSize: 48,
            color: '#ffffff',
            fontFamily: 'Figtree',
            fontWeight: 'bold',
            minWidth: 100,
            textAlign: 'left',
          }}
          keyboardType="numeric"
          autoFocus
          maxLength={6}
        />
        <Text variant="textLgRegular" color="secondaryText" marginLeft="2">
          /month
        </Text>
      </Box>
    </Box>

    {/* Negotiable Toggle */}
    <Box
      backgroundColor="inputBackground"
      borderRadius="xl"
      paddingHorizontal="4"
      paddingVertical="4"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Box>
        <Text variant="textMdMedium" color="primaryText">
          Open to negotiation
        </Text>
        <Text variant="textSmRegular" color="secondaryText">
          Let hosts know if you&apos;re flexible on price
        </Text>
      </Box>
      <Switch
        value={isNegotiable}
        onValueChange={onNegotiableChange}
        trackColor={{ false: '#555', true: '#3b82f6' }}
        thumbColor="#ffffff"
      />
    </Box>
  </Box>
);

const HardwareStep = ({
  selectedHardware,
  onSelectionChange,
}: {
  selectedHardware: string[];
  onSelectionChange: (hardware: string[]) => void;
}) => {
  const toggleHardware = (hardwareId: string) => {
    const newSelection = selectedHardware.includes(hardwareId)
      ? selectedHardware.filter(id => id !== hardwareId)
      : [...selectedHardware, hardwareId];
    onSelectionChange(newSelection);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
        justifyContent: 'center',
      }}
    >
      {hardwareOptions.map(hardware => {
        const isSelected = selectedHardware.includes(hardware.id);
        return (
          <Pressable key={hardware.id} onPress={() => toggleHardware(hardware.id)}>
            <Box
              borderRadius="xl"
              borderWidth={3}
              backgroundColor={isSelected ? 'base.white' : 'inputBackground'}
              paddingHorizontal="4"
              paddingVertical="4"
              alignItems="center"
              minWidth={120}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isSelected ? 0.2 : 0.05,
                shadowRadius: 8,
                elevation: isSelected ? 5 : 2,
                transform: [{ scale: isSelected ? 1.05 : 1 }],
              }}
            >
              <Box marginBottom="2">
                <hardware.Icon width={32} height={32} color={isSelected ? 'black' : 'white'} />
              </Box>
              <Text
                variant="textMdMedium"
                color={isSelected ? 'primaryBackground' : 'primaryText'}
                textAlign="center"
              >
                {hardware.name}
              </Text>
            </Box>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const PhotosStep = ({
  selectedImages,
  onImagesChange,
  uploadProgress,
  isLoading,
}: {
  selectedImages: ImagePicker.ImagePickerAsset[];
  onImagesChange: (images: ImagePicker.ImagePickerAsset[]) => void;
  uploadProgress: { completed: number; total: number };
  isLoading: boolean;
}) => {
  const handleImagePicker = async () => {
    try {
      const result = await pickImages(5 - selectedImages.length);
      if (result.success && result.images) {
        onImagesChange([...selectedImages, ...result.images].slice(0, 5));
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(selectedImages.filter((_, i) => i !== index));
  };

  return (
    <Box>
      {/* Selected Images */}
      {selectedImages.length > 0 && (
        <Box marginBottom="4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Box flexDirection="row" gap="3" paddingHorizontal="2">
              {selectedImages.map((image, index) => (
                <Box key={index} position="relative">
                  <Image
                    source={{ uri: image.uri }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 16,
                    }}
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: '#ef4444',
                      borderRadius: 16,
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text variant="textMdBold" color="primaryBackground">
                      ×
                    </Text>
                  </Pressable>
                </Box>
              ))}
            </Box>
          </ScrollView>
        </Box>
      )}

      {/* Add Photos Button */}
      {selectedImages.length < 5 && (
        <Pressable onPress={handleImagePicker} disabled={isLoading}>
          <Box
            backgroundColor="gray.700"
            borderRadius="xl"
            borderWidth={3}
            borderStyle="dashed"
            padding="6"
            alignItems="center"
            justifyContent="center"
            minHeight={150}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 40 }} marginBottom="2">
              📸
            </Text>
            <Text variant="textLgBold" color="blue.500" marginBottom="1">
              {selectedImages.length === 0 ? 'Add Photos' : 'Add More Photos'}
            </Text>
            <Text variant="textMdRegular" color="secondaryText" textAlign="center">
              {selectedImages.length}/5 selected
            </Text>
          </Box>
        </Pressable>
      )}

      {/* Upload Progress */}
      {isLoading && uploadProgress.total > 0 && (
        <Box marginTop="4" padding="4" backgroundColor="inputBackground" borderRadius="xl">
          <Text variant="textMdRegular" color="primaryText" marginBottom="3" textAlign="center">
            Uploading images... {uploadProgress.completed}/{uploadProgress.total}
          </Text>
          <Box backgroundColor="secondaryText" height={6} borderRadius="xs" overflow="hidden">
            <Box
              backgroundColor="blue.500"
              height="100%"
              width={`${(uploadProgress.completed / uploadProgress.total) * 100}%`}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

const PaymentStep = ({
  paymentStatus,
  transactionSignature,
  onPaymentSuccess,
  onPaymentFailure,
  isLoading,
  amount,
  recipientAddress,
}: {
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  transactionSignature: string | null;
  onPaymentSuccess: (signature: string) => Promise<void>;
  onPaymentFailure: (error: string) => void;
  isLoading: boolean;
  amount: number;
  recipientAddress: string;
}) => {
  const getStatusDisplay = () => {
    switch (paymentStatus) {
      case 'completed':
        return {
          icon: '🎉',
          title: 'Payment Successful!',
          subtitle: 'Your location is being created...',
          color: '#10b981', // emerald-500
          bgColor: 'rgba(16, 185, 129, 0.1)',
        };
      case 'failed':
        return {
          icon: '💫',
          title: 'Payment Issue',
          subtitle: "Let's try that again",
          color: '#f59e0b', // amber-500
          bgColor: 'rgba(245, 158, 11, 0.1)',
        };
      case 'processing':
        return {
          icon: '⚡',
          title: transactionSignature ? 'Creating Location...' : 'Processing Payment...',
          subtitle: transactionSignature
            ? 'Uploading images and finalizing...'
            : 'Please confirm in your wallet',
          color: '#3b82f6', // blue-500
          bgColor: 'white',
        };
      default:
        return {
          icon: '💳',
          title: 'Ready to Create Location',
          subtitle: `Connect your wallet to pay ${amount} SOL`,
          color: '#3b82f6', // blue-500
          bgColor: 'white',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Box>
      {/* Main Status Card */}
      <Box
        backgroundColor="inputBackground"
        borderRadius="3xl"
        padding="8"
        marginBottom="6"
        alignItems="center"
        style={{
          backgroundColor: statusDisplay.bgColor,
          borderWidth: 1,
          borderColor: statusDisplay.color + '20',
          shadowColor: statusDisplay.color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Text style={{ fontSize: 72 }} marginBottom="4">
          {statusDisplay.icon}
        </Text>
        <Text variant="textXlBold" marginBottom="2" style={{ color: statusDisplay.color }}>
          {statusDisplay.title}
        </Text>
        <Text
          variant="textMdRegular"
          color="secondaryText"
          textAlign="center"
          style={{ opacity: 0.8 }}
        >
          {statusDisplay.subtitle}
        </Text>
      </Box>

      {/* Payment Details */}
      <Box
        backgroundColor="inputBackground"
        borderRadius="2xl"
        padding="6"
        marginBottom="6"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="4"
        >
          <Text variant="textMdMedium" color="secondaryText">
            Amount
          </Text>
          <Text variant="textLgBold" color="primaryText">
            {amount} SOL
          </Text>
        </Box>

        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="4"
        >
          <Text variant="textMdMedium" color="secondaryText">
            Network
          </Text>
          <Box
            backgroundColor="base.white"
            paddingHorizontal="3"
            paddingVertical="1"
            borderRadius="full"
            style={{ opacity: 0.9 }}
          >
            <Text variant="textSmMedium" color="base.black">
              Devnet
            </Text>
          </Box>
        </Box>

        {transactionSignature && (
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text variant="textMdMedium" color="secondaryText">
              Transaction
            </Text>
            <Text variant="textMdRegular" color="blue.500" style={{ fontFamily: 'monospace' }}>
              {transactionSignature.slice(0, 6)}...{transactionSignature.slice(-4)}
            </Text>
          </Box>
        )}
      </Box>

      {/* Action Button */}
      {paymentStatus === 'pending' || paymentStatus === 'failed' ? (
        <Box>
          <MobileWalletAdapterButton
            paymentMode={true}
            paymentAmount={amount}
            recipientAddress={recipientAddress}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentFailure={onPaymentFailure}
            verifying={isLoading}
            paymentDescription="Location Creation Payment"
          />

          {/* Helpful tip */}
          <Box
            marginTop="4"
            padding="4"
            backgroundColor="inputBackground"
            borderRadius="xl"
            style={{ opacity: 0.7 }}
          >
            <Text variant="textSmRegular" color="secondaryText" textAlign="center">
              💡 Make sure you have a Solana wallet app installed (Phantom, Solflare, etc.)
            </Text>
          </Box>
        </Box>
      ) : paymentStatus === 'processing' ? (
        <Box
          backgroundColor="blue.500"
          paddingVertical="5"
          paddingHorizontal="6"
          borderRadius="2xl"
          alignItems="center"
          style={{
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text variant="textLgBold" color="primaryBackground">
            {transactionSignature ? '🏗️ Creating Location...' : '⚡ Processing Payment...'}
          </Text>
        </Box>
      ) : (
        <Box
          backgroundColor="green.500"
          paddingVertical="5"
          paddingHorizontal="6"
          borderRadius="2xl"
          alignItems="center"
          style={{
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text variant="textLgBold" color="primaryBackground">
            🎉 Payment Complete!
          </Text>
        </Box>
      )}
    </Box>
  );
};
