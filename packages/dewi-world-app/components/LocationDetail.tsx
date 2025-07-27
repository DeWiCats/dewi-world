import { GeoJSONFeature } from '@/geojson';
import Box from './ui/Box';
import Text from './ui/Text';

interface LocationDetailProps {
  location: GeoJSONFeature;
}

export default function LocationDetail({ location }: LocationDetailProps) {
  return (
    <Box padding={"3xl"}>
      <Text variant={'textXsLight'} color="text.white">
        {location.properties.address}
      </Text>
      <Text variant={'textXsLight'} color="text.white">
        Description
      </Text>
      <Text variant={'textXsLight'} color="text.white">
        {location.properties.description}
      </Text>
      <Text variant="textXsLight" color="text.white">
        {location.properties.extras.join(', ')}
      </Text>
      <Text variant="textXsLight" color="text.white">
        Deployable Hardware
      </Text>
      {location.properties.depin_hardware.map(({ name, Icon }) => (
        <Box flexDirection="row" key={name + location.properties.name}>
          <Text variant="textXsLight" color="text.white">
            {name}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
