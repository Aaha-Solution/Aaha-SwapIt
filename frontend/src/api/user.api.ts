import api from './axiosInstance';
import { User } from '../types/user.types';
import { Product } from '../types/product.types';
import { ApiResponse } from '../types/api.types';
import { INITIAL_PRODUCTS } from '../utils/constants';

export const userApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          id: 'usr-demo-iyyanar',
          name: 'Iyyanar',
          email: 'iyyanar@example.com',
          phone: '+91 98401 98765',
          location: 'Chennai',
          memberSince: 'Sep 2024',
          verified: true,
        },
      };
    }
  },

  getMyAds: async (): Promise<ApiResponse<Product[]>> => {
    try {
      const response = await api.get('/users/my-ads');
      return response.data;
    } catch {
      // Return 2 sample ads for the user matching prototype count
      return {
        success: true,
        data: INITIAL_PRODUCTS.slice(0, 2),
      };
    }
  },
};
