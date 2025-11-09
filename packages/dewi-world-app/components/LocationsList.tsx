import { fetchLocationsGeoJSON, GeoJSONLocation } from '@/lib/geojsonAPI';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import CircleLoader from './CircleLoader';
import LocationItem from './LocationItem';
import { LocationSkeletonList } from './LocationSkeleton';
import SearchInput from './SearchInput';
import Box from './ui/Box';

interface LocationsListProps {
  locations: GeoJSONLocation[];
  onSelect: (location: GeoJSONLocation) => void;
  loading?: boolean;
  index?: number;
}

export default function LocationsList({
  locations,
  onSelect,
  loading = false,
  index,
}: LocationsListProps) {
  const ref = useRef<null | ScrollView>(null);
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [searchValue, setSearchValue] = useState('');

  const changeTextHandler = (text: string) => setSearchValue(text);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      // If search value is empty, show all locations
      if (searchValue.trim().length === 0) {
        setFilteredLocations(locations);
        return;
      }

      // Do initial search from current locations list
      const initialSearch = locations.filter(location =>
        location.properties.address.toLowerCase().includes(searchValue.toLowerCase())
      );

      if (initialSearch.length > 0) {
        setFilteredLocations(initialSearch);
        return;
      }

      //If no locations were found, search from all possible locations in the DB
      const params = { limit: 10, search: searchValue };

      const geoJson = await fetchLocationsGeoJSON(params);
      setFilteredLocations(geoJson.features);
    }, 700);
    return () => clearTimeout(timeout);
  }, [searchValue, locations]);

  const emptyComponent = useMemo(
    () => (
      <Box width="100%" gap="md" marginTop="md">
        {loading && <CircleLoader />}
        <LocationSkeletonList count={3} />
      </Box>
    ),
    [loading]
  );

  useEffect(() => {
    if (index === 0) ref?.current?.scrollTo({ y: 0 });
  }, [index]);

  return (
    <Box
      paddingHorizontal={'3xl'}
      paddingVertical="md"
      alignItems="center"
      gap="md"
      width="100%"
      height="100%"
    >
      <SearchInput
        onChangeText={changeTextHandler}
        height={50}
        backgroundColor={'secondaryBackground'}
        placeholder="Search for a location"
        textInputProps={{
          style: { height: 50, fontWeight: 'bold', color: 'white' },
        }}
      />
      {filteredLocations.length === 0 && emptyComponent}
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        style={{ width: '100%' }}
        contentContainerStyle={{ paddingBottom: 320, gap: 10 }}
      >
        {filteredLocations.map(item => (
          <LocationItem key={item.properties.name} onSelect={onSelect} location={item} />
        ))}
      </ScrollView>
    </Box>
  );
}
