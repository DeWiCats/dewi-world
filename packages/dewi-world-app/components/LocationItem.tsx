import { GeoJSONLocation } from '@/lib/geojsonAPI';
import { Image, Pressable } from 'react-native';
import { formatDistance, hardwareIconMap } from './LocationCard';
import ProfileDisplay from './ProfileDisplay';
import Box from './ui/Box';
import Text from './ui/Text';

interface LocationItemProps {
  location: GeoJSONLocation;
  onSelect?: (location: GeoJSONLocation) => void;
}

export default function LocationItem({ location, onSelect = () => {} }: LocationItemProps) {
  return (
    <Box
      width={'100%'}
      padding="xl"
      borderRadius="md"
      backgroundColor={'secondaryBackground'}
      gap="sm"
    >
      <Pressable onPress={() => onSelect(location)}>
        <Image
          width={100}
          height={100}
          style={{ width: '100%', height: 220 }}
          source={{
            uri:
              location.properties.gallery.at(0) ||
              'https://via.placeholder.com/220x220?text=No+Image',
          }}
        />
      </Pressable>
      <ProfileDisplay
        fetchProfile
        userId={location.properties.owner_id}
        rating={location.properties.rating}
      />
      <Text variant="textXsLight" color="gray.400">
        {location.properties.address}
      </Text>
      <Text variant="textSmLight" color="brand.600">
        {formatDistance(location.properties.distance || 0)}
      </Text>
      <Box flexDirection={'row'} gap="sm" alignItems={'center'}>
        {location.properties.deployable_hardware.map(hardware => {
          const IconComponent = hardwareIconMap[hardware as keyof typeof hardwareIconMap];
          return <IconComponent key={hardware + location.properties.name} width={25} height={25} />;
        })}
      </Box>
    </Box>
  );
}
