import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { useLocations } from '@/hooks/useLocations';
import { LocationPost } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import React from 'react';
import { Alert, Image, Pressable } from 'react-native';

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
}

const hardwareIconMap = {
  '5g': Icon5G,
  helium: IconHelium,
  wifi: IconWifi,
  lorawan: IconLorawan,
  weather: IconWeather,
  air: IconAir,
  marine: IconMarine,
};

export default function LocationCard({
  location,
  onPress,
  showDeleteButton = true,
}: LocationCardProps) {
  const { user } = useAuthStore();
  const { deleteLocation } = useLocations();

  const isOwner = user?.id === location.owner_id;

  const renderHardwareIcons = () => {
    return location.deployable_hardware.slice(0, 5).map((hardware, index) => {
      const IconComponent = hardwareIconMap[hardware as keyof typeof hardwareIconMap];

      if (!IconComponent) return null;

      return (
        <Box
          key={hardware}
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

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${distance}m away`;
    }
    return `${(distance / 1000).toFixed(1)}km away`;
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
          onPress: async () => {
            try {
              await deleteLocation(location.id);
              Alert.alert('Success', 'Location deleted successfully');
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete location'
              );
            }
          },
        },
      ]
    );
  };

  return (
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
        {location.gallery && location.gallery.length > 0 && (
          <Image
            source={{ uri: location.gallery[0] }}
            style={{
              width: '100%',
              height: 200,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
            resizeMode="cover"
          />
        )}

        {/* Delete button for owned locations */}
        {showDeleteButton && isOwner && (
          <Box position="absolute" top={12} right={12}>
            <Pressable onPress={handleDelete}>
              <Box
                width={32}
                height={32}
                borderRadius="full"
                alignItems="center"
                justifyContent="center"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text variant="textMdBold" color="primaryBackground">
                  ×
                </Text>
              </Box>
            </Pressable>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Pressable onPress={onPress}>
        <Box padding="4">
          {/* Address */}
          <Text variant="textMdRegular" color="secondaryText" marginBottom="2" numberOfLines={2}>
            {location.address}
          </Text>

          {/* Distance */}
          <Text variant="textSmRegular" color="blue.500" marginBottom="3">
            {formatDistance(location.distance)}
          </Text>

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
  );
}
