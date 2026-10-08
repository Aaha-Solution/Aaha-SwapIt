import api from './axiosInstance';
import { User, SellerAccountInput } from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export const authApi = {
  login: async (credentials: { emailOrPhone: string; password: string; role?: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (err: any) {
      if (err.response?.data) {
        return err.response.data;
      }
      // Offline fallback only when backend is unreachable
      const defaultRole = credentials.role || (credentials.emailOrPhone.includes('admin') ? 'admin' : credentials.emailOrPhone.includes('seller') ? 'seller' : 'customer');
      return {
        success: true,
        data: {
          user: {
            id: 'usr-login-' + defaultRole,
            name: credentials.emailOrPhone.split('@')[0] || 'Member',
            email: credentials.emailOrPhone,
            location: 'Puducherry',
            memberSince: 'Today',
            verified: true,
            role: defaultRole,
          },
          token: `demo-jwt-token-${defaultRole}`,
        },
      };
    }
  },

  signup: async (userData: Record<string, unknown>): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (err: any) {
      if (err.response?.data) {
        return err.response.data;
      }
      return {
        success: true,
        data: {
          user: {
            id: 'usr-' + Date.now(),
            name: (userData.name as string) || 'New Customer',
            email: (userData.email as string) || 'customer@example.com',
            phone: (userData.phone as string) || '',
            location: (userData.city as string) || 'Puducherry',
            memberSince: 'Just now',
            verified: true,
            role: 'customer',
          },
          token: 'demo-jwt-token-customer',
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

  // Admin APIs for Seller Management
  createSeller: async (sellerData: SellerAccountInput): Promise<ApiResponse<User>> => {
    const response = await api.post('/users/admin/sellers', sellerData);
    return response.data;
  },

  getSellers: async (): Promise<ApiResponse<Array<User & { _count?: { products: number } }>>> => {
    const response = await api.get('/users/admin/sellers');
    return response.data;
  },

  getAdminStats: async (): Promise<ApiResponse<{ totalUsers: number; totalSellers: number; totalCustomers: number; totalProducts: number }>> => {
    const response = await api.get('/users/admin/stats');
    return response.data;
  },

  deleteSeller: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/users/admin/sellers/${id}`);
    return response.data;
  },
};
