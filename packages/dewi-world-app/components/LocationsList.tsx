import { Theme } from '@/constants/theme';
import { GeoJSONLocation } from '@/lib/geojsonAPI';
import { useTheme } from '@shopify/restyle';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import LocationItem from './LocationItem';
import SearchInput from './SearchInput';
import Box from './ui/Box';

interface LocationsListProps {
  locations: GeoJSONLocation[];
  onSelect: (location: GeoJSONLocation) => void;
}

export default function LocationsList({ locations, onSelect }: LocationsListProps) {
  const { spacing } = useTheme<Theme>();
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [searchValue, setSearchValue] = useState('');

  const changeTextHandler = (text: string) => setSearchValue(text);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!searchValue) setFilteredLocations(locations);
      setFilteredLocations(
        locations.filter(location =>
          location.properties.address.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  return (
    <Box paddingHorizontal={'3xl'} paddingVertical="md" alignItems="center" gap="md" width="100%">
      <SearchInput
        onChangeText={changeTextHandler}
        height={50}
        backgroundColor={'secondaryBackground'}
        placeholder="Search for a location"
        textInputProps={{
          style: { height: 50, fontWeight: 'bold', color: 'white' },
        }}
      />
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing['11xl'] }}
      >
        {filteredLocations.map(location => (
          <LocationItem onSelect={onSelect} key={location.properties.name} location={location} />
        ))}
      </ScrollView>
    </Box>
  );
}
