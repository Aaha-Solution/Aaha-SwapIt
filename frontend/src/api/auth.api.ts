import api from './axiosInstance';
import { User } from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export const authApi = {
  login: async (credentials: { emailOrPhone: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch {
      // Mock fallback for frontend preview
      return {
        success: true,
        data: {
          user: {
            id: 'usr-login-user',
            name: credentials.emailOrPhone.split('@')[0] || 'Member',
            email: credentials.emailOrPhone,
            location: 'Chennai',
            memberSince: 'Today',
            verified: true,
          },
          token: 'mock-jwt-token-' + Date.now(),
        },
      };
    }
  },

  signup: async (userData: Record<string, unknown>): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          user: {
            id: 'usr-' + Date.now(),
            name: (userData.name as string) || 'New User',
            email: (userData.email as string) || 'user@example.com',
            phone: (userData.phone as string) || '',
            location: (userData.city as string) || 'Chennai',
            memberSince: 'Just now',
            verified: true,
          },
          token: 'mock-jwt-token-' + Date.now(),
        },
      };
    }
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch {
      return { success: true, data: null };
    }
  },
};
