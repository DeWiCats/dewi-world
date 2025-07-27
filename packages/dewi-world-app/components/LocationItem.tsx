import { GeoJSONFeature } from '@/geojson';
import { Image } from 'react-native';
import Box from './ui/Box';
import Text from './ui/Text';

interface LocationItemProps {
  location: GeoJSONFeature;
}

export default function LocationItem({ location }: LocationItemProps) {
  return (
    <Box width={'100%'} padding="xl" borderRadius="md" backgroundColor={'secondaryBackground'}>
      <Image
        width={100}
        height={100}
        style={{ width: '100%', height: 220 }}
        source={location.properties.photos[0]}
      />
      <Text variant="textSmLight" color="gray.600">
        {location.properties.address}
      </Text>
    </Box>
  );
}
