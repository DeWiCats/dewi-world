import { GeoJSONLocation } from '@/lib/geojsonAPI';
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import LocationItem from './LocationItem';
import { LocationSkeletonList } from './LocationSkeleton';
import SearchInput from './SearchInput';
import Box from './ui/Box';

interface LocationsListProps {
  locations: GeoJSONLocation[];
  onSelect: (location: GeoJSONLocation) => void;
}

export default function LocationsList({ locations, onSelect }: LocationsListProps) {
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [searchValue, setSearchValue] = useState('');

  const changeTextHandler = (text: string) => setSearchValue(text);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue.trim().length == 0) setFilteredLocations(locations);
      setFilteredLocations(
        locations.filter(location =>
          location.properties.address.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchValue, locations]);

  useEffect(() => console.log('filteredLocations', filteredLocations), [filteredLocations]);

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
      <FlatList
        style={{ width: '100%' }}
        data={filteredLocations}
        refreshing={!locations}
        ListEmptyComponent={<LocationSkeletonList count={3} />}
        renderItem={({ item }) => (
          <LocationItem onSelect={onSelect} key={item.properties.name} location={item} />
        )}
      />
    </Box>
  );
}
