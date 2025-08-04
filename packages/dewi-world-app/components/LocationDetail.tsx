import { GeoJSONLocation } from '@/lib/geojsonAPI';
import { formatDistance, hardwareIconMap } from './LocationCard';
import ProfileDisplay from './ProfileDisplay';
import Box from './ui/Box';
import Text from './ui/Text';

interface LocationDetailProps {
  location: GeoJSONLocation;
}

export default function LocationDetail({ location }: LocationDetailProps) {
  return (
    <Box padding={'3xl'} gap="3xl" width="100%">
      <Box gap="md">
        <ProfileDisplay />
        <Text variant="textXsLight" color="gray.400">
          {location.properties.address}
        </Text>
        <Text variant="textSmLight" color="brand.600">
          {formatDistance(location.properties.distance || 0)}
        </Text>
      </Box>
      <Box gap="sm">
        <Text fontWeight={'bold'} variant={'textMdLight'} color="text.white">
          Description
        </Text>
        <Text variant={'textXsLight'} color="gray.400">
          {location.properties.description}
        </Text>
      </Box>
      <Box gap="md">
        <Text fontWeight={'bold'} variant={'textMdLight'} color="text.white">
          Deployable Hardware
        </Text>
        <Box flexDirection={'row'} gap="md" alignItems={'center'}>
          {location.properties.deployable_hardware.map(hardware => {
            const IconComponent = hardwareIconMap[hardware as keyof typeof hardwareIconMap];
            return (
              <IconComponent key={hardware + location.properties.name} width={25} height={25} />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
