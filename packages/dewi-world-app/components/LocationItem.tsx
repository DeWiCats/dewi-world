import { GeoJSONFeature } from '@/geojson';
import { Image, Pressable } from 'react-native';
import ProfileDisplay from './ProfileDisplay';
import Box from './ui/Box';
import Text from './ui/Text';

interface LocationItemProps {
  location: GeoJSONFeature;
  onSelect?: (location: GeoJSONFeature) => void;
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
          source={
            location.properties.photos && location.properties.photos[0]
              ? location.properties.photos[0]
              : { uri: 'https://via.placeholder.com/220x220?text=No+Image' }
          }
        />
      </Pressable>
      <ProfileDisplay />
      <Text variant="textXsLight" color="gray.400">
        {location.properties.address}
      </Text>
      <Text variant="textSmLight" color="brand.600">
        500m away
      </Text>
      <Box flexDirection={'row'} gap="sm" alignItems={'center'}>
        {location.properties.depin_hardware.map(({ name, Icon }, index) => (
          <Icon key={`${name}-${location.properties.name}-${index}`} width={25} height={25} />
        ))}
      </Box>
    </Box>
  );
}
