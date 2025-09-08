import { useAuthStore } from '@/stores/useAuthStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3006';
const ENDPOINT_URL = `${API_BASE_URL}/api/v1/user`;

export interface Profile {
  user_id: string;
  username: string;
  avatar: string;
  dewi_verified?: boolean;
  blue_chip?: boolean;
  verified_address?: string;
}

export interface ProfileCreationRequest {
  user_id: string;
  username: string;
  avatar: string;
}

export class UsersAPI {
  private getAuthHeaders(): { Authorization: string } {
    const { getAuthHeaders } = require('@/lib/authHelpers');
    return getAuthHeaders();
  }

  async updateUserProfile(
    payload: Partial<Record<'username' | 'avatar', string>>
  ): Promise<Profile> {
    try {
      const headers = this.getAuthHeaders();

      const response = await fetch(ENDPOINT_URL, {
        method: 'PUT',
        body: JSON.stringify(payload),
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
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async getUserProfile(
    payload: Partial<Omit<Profile & { email: string }, 'dewi_verified' | 'blue_chip'>>
  ): Promise<null | Profile> {
    try {
      const params = new URLSearchParams(payload).toString();

      const url = `${ENDPOINT_URL}?${params}`;

      const response = await fetch(url);

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

  async deleteProfileById(uid: string) {
    try {
      const url = `${ENDPOINT_URL}/deleteProfile?user_id=${uid}`;

      const response = await fetch(url, {
        method: 'DELETE',
      });

      const { data, message } = await response.json();

      if (!response.ok) {
        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }

  async resetPasswordForEmail(email: string) {
    try {
      const response = await fetch(`${ENDPOINT_URL}/sendResetPasswordEmail?email=${email}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async createUserProfile(payload: ProfileCreationRequest): Promise<Profile> {
    try {
      const response = await fetch(ENDPOINT_URL, {
        method: 'POST',
        body: JSON.stringify({
          username: payload.username,
          user_id: payload.user_id,
          avatar: payload.avatar,
        }),
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
