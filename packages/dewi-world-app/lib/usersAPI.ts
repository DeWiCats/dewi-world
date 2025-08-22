import { useAuthStore } from '@/stores/useAuthStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3006';
const ENDPOINT_URL = `${API_BASE_URL}/api/v1/user`;

export interface Profile {
  user_id: string;
  username: string;
  avatar: string;
}

export class UsersAPI {
  private getAuthHeaders(): { Authorization: string } {
    const { getAuthHeaders } = require('@/lib/authHelpers');
    return getAuthHeaders();
  }

  async getUserProfile(payload: Partial<Profile>): Promise<null | Profile> {
    try {
      const params = new URLSearchParams(payload).toString();

      const response = await fetch(`${ENDPOINT_URL}?${params}`, {});

      const { data, message } = await response.json();

      if (!response.ok) {
        throw new Error(message);
      }

      return data?.at(0);
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async createUserProfile(payload: Profile): Promise<Profile> {
    try {
      const response = await fetch(ENDPOINT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const { data, message } = await response.json();

      if (!response.ok) {
        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async deleteCurrentUser() {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error('User must be logged in before deleting');
      }

      const headers = this.getAuthHeaders();

      const response = await fetch(ENDPOINT_URL, {
        method: 'DELETE',
        headers: {
          ...headers,
        },
      });

      const { data, message } = await response.json();

      if (!response.ok) {
        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
