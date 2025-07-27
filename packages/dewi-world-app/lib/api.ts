import { getAuthHeaders, handleAuthError, requireAuth } from '@/lib/authHelpers';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  CreateLocationRequest,
  LocationPost,
  LocationQueryParams,
  LocationResponse,
  mockLocationsAPI,
  UpdateLocationRequest,
} from '@/utils/mockLocations';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3006';

// Real API functions
class RealLocationsAPI {
  private getAuthHeaders() {
    return getAuthHeaders();
  }

  async getLocations(params?: LocationQueryParams): Promise<LocationResponse> {
    try {
      requireAuth();

      const headers = this.getAuthHeaders();
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const url = `${API_BASE_URL}/api/v1/locations${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching locations:', error);
      handleAuthError(error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch locations');
    }
  }

  async getLocation(id: string): Promise<LocationResponse> {
    try {
      requireAuth();

      const headers = this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/locations/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching location:', error);
      handleAuthError(error);
      throw error;
    }
  }

  async createLocation(locationData: CreateLocationRequest): Promise<LocationResponse> {
    try {
      requireAuth();

      const headers = this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating location:', error);
      handleAuthError(error);
      throw error;
    }
  }

  async updateLocation(id: string, updateData: UpdateLocationRequest): Promise<LocationResponse> {
    try {
      requireAuth();

      const headers = this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/locations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating location:', error);
      handleAuthError(error);
      throw error;
    }
  }

  async deleteLocation(id: string): Promise<LocationResponse> {
    try {
      requireAuth();

      const headers = this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting location:', error);
      handleAuthError(error);
      throw error;
    }
  }

  get loading(): boolean {
    return false; // Real API doesn't have a global loading state
  }
}

// Create singleton instances
const realAPI = new RealLocationsAPI();

// Main API interface that switches between mock and real
export class LocationsAPI {
  async getLocations(params?: LocationQueryParams): Promise<LocationResponse> {
    const { mockMode } = useAppStore.getState();

    if (mockMode) {
      return mockLocationsAPI.getLocations(params);
    } else {
      // Filter by current user for real API
      const { user } = useAuthStore.getState();
      const userParams = { ...params, owner_id: user?.id };
      return realAPI.getLocations(userParams);
    }
  }

  async getLocation(id: string): Promise<LocationResponse> {
    const { mockMode } = useAppStore.getState();
    return mockMode ? mockLocationsAPI.getLocation(id) : realAPI.getLocation(id);
  }

  async createLocation(locationData: CreateLocationRequest): Promise<LocationResponse> {
    const { mockMode } = useAppStore.getState();
    return mockMode
      ? mockLocationsAPI.createLocation(locationData)
      : realAPI.createLocation(locationData);
  }

  async updateLocation(id: string, updateData: UpdateLocationRequest): Promise<LocationResponse> {
    const { mockMode } = useAppStore.getState();
    return mockMode
      ? mockLocationsAPI.updateLocation(id, updateData)
      : realAPI.updateLocation(id, updateData);
  }

  async deleteLocation(id: string): Promise<LocationResponse> {
    const { mockMode } = useAppStore.getState();
    return mockMode ? mockLocationsAPI.deleteLocation(id) : realAPI.deleteLocation(id);
  }

  get loading(): boolean {
    const { mockMode } = useAppStore.getState();
    return mockMode ? mockLocationsAPI.loading : realAPI.loading;
  }
}

// Export singleton instance
export const locationsAPI = new LocationsAPI();

// Export types for convenience
export type {
  CreateLocationRequest,
  LocationPost,
  LocationQueryParams,
  LocationResponse,
  UpdateLocationRequest,
};
