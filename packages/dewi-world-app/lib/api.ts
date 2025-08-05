import { getAuthHeaders, handleAuthError, requireAuth } from '@/lib/authHelpers';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  CreateLocationRequest,
  LocationPost,
  LocationQueryParams,
  LocationResponse,
  UpdateLocationRequest,
} from '@/utils/mockLocations';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.0.133:3006';

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
      console.log('🔐 Creating location - Auth debug:');
      const { user, session, hydrated } = useAuthStore.getState();
      console.log('Auth state:', {
        hydrated,
        hasUser: !!user,
        hasSession: !!session,
        hasToken: !!session?.access_token,
        userEmail: user?.email,
        tokenPreview: session?.access_token?.substring(0, 30) + '...',
      });

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
      console.log('🔴 Error creating location:', error);
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
      console.log('🗑️ Deleting location:', id);
      console.log('🔑 Auth headers:', headers);

      const url = `${API_BASE_URL}/api/v1/locations/${id}`;
      console.log('🌐 DELETE URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          // Don't set Content-Type for DELETE requests (no body)
          ...headers,
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Delete response error body:', errorBody);

        // Check if it's a UUID validation error
        if (errorBody.includes('must match format "uuid"')) {
          throw new Error(`Invalid location ID format. Expected UUID but got: ${id}`);
        }

        throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`);
      }

      const result = await response.json();
      console.log('✅ Delete success:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting location:', error);
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

// Production-ready API interface - always uses real API
export class LocationsAPI {
  async getLocations(params?: LocationQueryParams): Promise<LocationResponse> {
    // Always use real API for production
    const { user } = useAuthStore.getState();
    const userParams = { ...params, owner_id: user?.id };
    return realAPI.getLocations(userParams);
  }

  async getLocation(id: string): Promise<LocationResponse> {
    return realAPI.getLocation(id);
  }

  async createLocation(locationData: CreateLocationRequest): Promise<LocationResponse> {
    return realAPI.createLocation(locationData);
  }

  async updateLocation(id: string, updateData: UpdateLocationRequest): Promise<LocationResponse> {
    return realAPI.updateLocation(id, updateData);
  }

  async deleteLocation(id: string): Promise<LocationResponse> {
    return realAPI.deleteLocation(id);
  }

  get loading(): boolean {
    return realAPI.loading;
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
