import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { useLocations } from '@/hooks/useLocations';
import { LocationPost } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// Import hardware icons
import Icon5G from '@assets/svgs/5g-logo.svg';
import IconAir from '@assets/svgs/air-logo.svg';
import IconHelium from '@assets/svgs/helium-logo.svg';
import IconLorawan from '@assets/svgs/lorawan-logo.svg';
import IconMarine from '@assets/svgs/marine-logo.svg';
import IconWeather from '@assets/svgs/weather-logo.svg';
import IconWifi from '@assets/svgs/wifi-logo.svg';

interface LocationCardProps {
  location: LocationPost;
  onPress?: () => void;
  showDeleteButton?: boolean;
  onDeleteStart?: (locationId: string) => void;
  onDeleteComplete?: (locationId: string) => void;
  onDeleteError?: (locationId: string, error: Error) => void;
}

export const hardwareIconMap = {
  '5g': Icon5G,
  helium: IconHelium,
  wifi: IconWifi,
  lorawan: IconLorawan,
  weather: IconWeather,
  air: IconAir,
  marine: IconMarine,
};

export const formatDistance = (distance: number) => {
  if (distance < 1000) {
    return `${distance}m away`;
  }
  return `${(distance / 1000).toFixed(1)}km away`;
};

export default function LocationCard({
  location,
  onPress,
  showDeleteButton = true,
  onDeleteStart,
  onDeleteComplete,
  onDeleteError,
}: LocationCardProps) {
  const { user } = useAuthStore();
  const { deleteLocation } = useLocations();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Animation values for premium UX
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const isOwner = user?.id === location.owner_id;

  // Debug: Log image URL for troubleshooting
  useEffect(() => {
    if (location.gallery && location.gallery.length > 0) {
      console.log('🖼️ LocationCard - Image URL:', location.gallery[0]);
      console.log('🖼️ LocationCard - Full gallery:', location.gallery);
    }
  }, [location.gallery]);

  const renderHardwareIcons = () => {
    return location.deployable_hardware.slice(0, 5).map((hardware, index) => {
      const IconComponent = hardwareIconMap[hardware as keyof typeof hardwareIconMap];

      if (!IconComponent) return null;

      return (
        <Box
          key={`${hardware}-${index}`}
          width={32}
          height={32}
          borderRadius="full"
          backgroundColor="cardBackground"
          alignItems="center"
          justifyContent="center"
          marginLeft={index > 0 ? '-2' : '0'}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <IconComponent width={20} height={20} />
        </Box>
      );
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Location',
      'Are you sure you want to delete this location? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => performDelete(),
        },
      ]
    );
  };

  const performDelete = async () => {
    try {
      setIsDeleting(true);

      // Notify parent of optimistic delete start
      onDeleteStart?.(location.id);

      // Start elegant deletion animation
      opacity.value = withTiming(0.5, { duration: 200 });
      scale.value = withTiming(0.95, { duration: 200 });
      translateY.value = withTiming(-10, { duration: 200 });

      // Perform actual deletion
      await deleteLocation(location.id);

      // Complete deletion with smooth fade and slide
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
      translateY.value = withTiming(-50, { duration: 300 }, finished => {
        if (finished && onDeleteComplete) {
          runOnJS(onDeleteComplete)(location.id);
        }
      });
    } catch (error) {
      console.error('❌ Delete failed, reverting optimistic update:', error);

      // Elegant bounce-back animation on error
      opacity.value = withSequence(
        withTiming(0.3, { duration: 100 }),
        withTiming(1, { duration: 300 })
      );
      scale.value = withSequence(
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 300 })
      );
      translateY.value = withSequence(
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 300 })
      );

      setIsDeleting(false);
      onDeleteError?.(location.id, error instanceof Error ? error : new Error('Delete failed'));

      Alert.alert(
        'Delete Failed',
        error instanceof Error ? error.message : 'Failed to delete location',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Animated styles for premium deletion UX
  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedCardStyle]}>
      <Box
        backgroundColor="cardBackground"
        borderRadius="xl"
        marginBottom="4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {/* Image with delete button overlay */}
        <Box position="relative">
          {location.gallery && location.gallery.length > 0 && !imageError ? (
            <Box position="relative">
              <Image
                source={{ uri: location.gallery[0] }}
                style={{
                  width: '100%',
                  height: 200,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
                resizeMode="cover"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />

              {/* Loading overlay */}
              {imageLoading && (
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  backgroundColor="inputBackground"
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                >
                  <Text variant="textSmRegular" color="secondaryText">
                    Loading...
                  </Text>
                </Box>
              )}
            </Box>
          ) : (
            // Fallback when no image or image failed to load
            <Box
              width="100%"
              height={200}
              backgroundColor="inputBackground"
              alignItems="center"
              justifyContent="center"
              style={{
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
            >
              <Text variant="textLgRegular" color="secondaryText" marginBottom="2">
                📍
              </Text>
              <Text variant="textSmRegular" color="secondaryText">
                {imageError ? 'Image failed to load' : 'No image available'}
              </Text>
            </Box>
          )}

          {/* Premium Delete button with states */}
          {showDeleteButton && isOwner && (
            <Box position="absolute" top={12} right={12}>
              <Pressable onPress={handleDelete} disabled={isDeleting}>
                <Box
                  width={32}
                  height={32}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    backgroundColor: isDeleting
                      ? 'rgba(239, 68, 68, 0.5)'
                      : 'rgba(239, 68, 68, 0.9)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Text variant="textMdBold" color="primaryBackground">
                    {isDeleting ? '⏳' : '×'}
                  </Text>
                </Box>
              </Pressable>
            </Box>
          )}
        </Box>

        {/* Content */}
        <Pressable onPress={onPress} disabled={isDeleting}>
          <Box padding="4" style={{ opacity: isDeleting ? 0.7 : 1 }}>
            {/* Title */}
            <Text variant="textLgBold" color="primaryText" marginBottom="1" numberOfLines={1}>
              {location.title}
            </Text>

            {/* Address */}
            <Text variant="textMdRegular" color="secondaryText" marginBottom="2" numberOfLines={2}>
              {location.address}
            </Text>

            {/* Price and Distance Row */}
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              marginBottom="3"
            >
              <Text variant="textLgBold" color="blue.500">
                ${location.price}
                {location.is_negotiable ? '/mo' : '/mo (fixed)'}
              </Text>
              <Text variant="textSmRegular" color="secondaryText">
                {formatDistance(location.distance)}
              </Text>
            </Box>

            {/* Hardware Icons Row */}
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Box flexDirection="row" alignItems="center">
                {renderHardwareIcons()}
                {location.deployable_hardware.length > 5 && (
                  <Box
                    width={32}
                    height={32}
                    borderRadius="full"
                    backgroundColor="inputBackground"
                    alignItems="center"
                    justifyContent="center"
                    marginLeft="-2"
                  >
                    <Text variant="textXsRegular" color="secondaryText">
                      +{location.deployable_hardware.length - 5}
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Navigation Arrow */}
              <Box width={24} height={24} alignItems="center" justifyContent="center">
                <Text variant="textMdRegular" color="secondaryText">
                  →
                </Text>
              </Box>
            </Box>
          </Box>
        </Pressable>
      </Box>
    </Animated.View>
  );
}
