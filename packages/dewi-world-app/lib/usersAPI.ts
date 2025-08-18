import { useAuthStore } from '@/stores/useAuthStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3006';

export class UsersAPI {
  private getAuthHeaders(): { Authorization: string } {
    const { getAuthHeaders } = require('@/lib/authHelpers');
    return getAuthHeaders();
  }

  async deleteCurrentUser() {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error('User must be logged in before deleting');
      }

      const headers = this.getAuthHeaders();
      const url = `${API_BASE_URL}/api/v1/user`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
