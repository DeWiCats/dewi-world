import { CreateLocationRequest, LocationPost, LocationQueryParams, locationsAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCallback, useEffect, useState } from 'react';

export function useLocations(params?: LocationQueryParams) {
  const [locations, setLocations] = useState<LocationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchLocations = useCallback(async () => {
    if (!user) {
      setLocations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await locationsAPI.getLocations(params);

      if (response.success && Array.isArray(response.data)) {
        setLocations(response.data);
      } else {
        setError(response.message || 'Failed to fetch locations');
        setLocations([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [user, params]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const createLocation = useCallback(async (locationData: CreateLocationRequest) => {
    try {
      setError(null);
      const response = await locationsAPI.createLocation(locationData);

      if (response.success && !Array.isArray(response.data)) {
        // Add the new location to the list
        setLocations(prev => [response.data as LocationPost, ...prev]);
        return response.data as LocationPost;
      } else {
        throw new Error(response.message || 'Failed to create location');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteLocation = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await locationsAPI.deleteLocation(id);

      if (response.success) {
        // Remove the location from the list
        setLocations(prev => prev.filter(location => location.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete location');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refreshLocations = useCallback(() => {
    fetchLocations();
  }, [fetchLocations]);

  return {
    locations,
    loading,
    error,
    createLocation,
    deleteLocation,
    refreshLocations,
  };
}

export function useLocation(id: string) {
  const [location, setLocation] = useState<LocationPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLocation(null);
      setLoading(false);
      return;
    }

    const fetchLocation = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await locationsAPI.getLocation(id);

        if (response.success && !Array.isArray(response.data)) {
          setLocation(response.data);
        } else {
          setError(response.message || 'Failed to fetch location');
          setLocation(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLocation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  return { location, loading, error };
}
