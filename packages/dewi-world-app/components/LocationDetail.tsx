import { GeoJSONFeature } from '@/geojson';
import ProfileDisplay from './ProfileDisplay';
import Box from './ui/Box';
import Text from './ui/Text';

interface LocationDetailProps {
  location: GeoJSONFeature;
}

export default function LocationDetail({ location }: LocationDetailProps) {
  return (
    <Box padding={'3xl'} gap="3xl">
      <Box gap="md">
        <ProfileDisplay />
        <Text variant="textXsLight" color="gray.400">
          {location.properties.address}
        </Text>
        <Text variant="textSmLight" color="brand.600">
          500m away
        </Text>
      </Box>
      <Box gap="sm">
        <Text fontWeight={'bold'} variant={'textMdLight'} color="text.white">
          Description
        </Text>
        <Text variant={'textXsLight'} color="gray.400">
          {location.properties.description}
        </Text>
        <Text variant="textXsLight" color="gray.400">
          {location.properties.extras.join(', ')}
        </Text>
      </Box>
      <Box gap="md">
        <Text fontWeight={'bold'} variant={'textMdLight'} color="text.white">
          Deployable Hardware
        </Text>
        <Box flexDirection={'row'} gap="md" alignItems={'center'}>
          {location.properties.depin_hardware.map(({ name, Icon }) => (
            <Icon key={name + location.properties.name} width={25} height={25} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
