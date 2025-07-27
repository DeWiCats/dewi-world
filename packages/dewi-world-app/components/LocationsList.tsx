import { Theme } from '@/constants/theme';
import { GeoJSONFeature } from '@/geojson';
import { useTheme } from '@shopify/restyle';
import { ScrollView } from 'react-native-gesture-handler';
import LocationItem from './LocationItem';
import SearchInput from './SearchInput';
import Box from './ui/Box';

interface LocationsListProps {
  locations: GeoJSONFeature[];
}

export default function LocationsList({ locations }: LocationsListProps) {
  const { spacing } = useTheme<Theme>();

  return (
    <Box paddingHorizontal={'3xl'} paddingVertical="md" alignItems="center" gap="md" width="100%">
      <SearchInput
        height={50}
        backgroundColor={'secondaryBackground'}
        placeholder="Search for a location"
        textInputProps={{
          style: { height: 50, fontWeight: 'bold' },
        }}
      />
      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ gap: spacing.md }}>
        {locations.map(location => (
          <LocationItem key={location.properties.name} location={location} />
        ))}
      </ScrollView>
    </Box>
  );
}
