// Example usage of the Mock Locations API
// This shows how to integrate the mock API into your React Native app

import { CreateLocationRequest, LocationQueryParams, mockLocationsAPI } from './mockLocations';

// Example: Get all locations
export const getLocationsExample = async () => {
  try {
    const response = await mockLocationsAPI.getLocations();
    console.log('All locations:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
  }
};

// Example: Get locations with filters
export const getFilteredLocationsExample = async () => {
  const filters: LocationQueryParams = {
    hardware: 'helium',
    min_price: 50,
    max_price: 200,
    negotiable: true,
    limit: 10,
    offset: 0,
  };

  try {
    const response = await mockLocationsAPI.getLocations(filters);
    console.log('Filtered locations:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered locations:', error);
  }
};

// Example: Get single location
export const getLocationExample = async (locationId: string) => {
  try {
    const response = await mockLocationsAPI.getLocation(locationId);
    if (response.success) {
      console.log('Location details:', response.data);
      return response.data;
    } else {
      console.log('Location not found:', response.message);
    }
  } catch (error) {
    console.error('Error fetching location:', error);
  }
};

// Example: Create new location
export const createLocationExample = async () => {
  const newLocation: CreateLocationRequest = {
    title: 'New Coffee Shop Location',
    description: 'Great location in busy downtown area with reliable power and internet',
    address: 'Downtown Miami, FL',
    deployable_hardware: ['wifi', '5g'],
    price: 125,
    is_negotiable: true,
    gallery: ['https://example.com/image1.jpg'],
    rating: 4.0,
    distance: 800,
  };

  try {
    const response = await mockLocationsAPI.createLocation(newLocation);
    console.log('Created location:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating location:', error);
  }
};

// Example: Update location
export const updateLocationExample = async (locationId: string) => {
  const updates = {
    price: 150,
    is_negotiable: false,
    rating: 4.5,
  };

  try {
    const response = await mockLocationsAPI.updateLocation(locationId, updates);
    console.log('Updated location:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating location:', error);
  }
};

// Example: Delete location
export const deleteLocationExample = async (locationId: string) => {
  try {
    const response = await mockLocationsAPI.deleteLocation(locationId);
    console.log('Delete result:', response.message);
    return response.success;
  } catch (error) {
    console.error('Error deleting location:', error);
  }
};

// Example: Using in a React Native component
export const useLocationsAPI = () => {
  const isLoading = mockLocationsAPI.loading;

  const refreshData = () => {
    mockLocationsAPI.resetData();
  };

  return {
    isLoading,
    refreshData,
    getLocations: mockLocationsAPI.getLocations.bind(mockLocationsAPI),
    getLocation: mockLocationsAPI.getLocation.bind(mockLocationsAPI),
    createLocation: mockLocationsAPI.createLocation.bind(mockLocationsAPI),
    updateLocation: mockLocationsAPI.updateLocation.bind(mockLocationsAPI),
    deleteLocation: mockLocationsAPI.deleteLocation.bind(mockLocationsAPI),
  };
};

// Example React Native component usage
/*
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { LocationPost } from '../utils/mockLocations';
import { useLocationsAPI } from '../utils/apiExample';

export const LocationsScreen: React.FC = () => {
  const [locations, setLocations] = useState<LocationPost[]>([]);
  const { getLocations, isLoading } = useLocationsAPI();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const response = await getLocations();
    if (response.success) {
      setLocations(response.data as LocationPost[]);
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Text>{item.address}</Text>
            <Text>${item.price}/month</Text>
          </View>
        )}
      />
    </View>
  );
};
*/
