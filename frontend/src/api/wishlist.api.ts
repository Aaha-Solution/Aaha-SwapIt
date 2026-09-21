import api from './axiosInstance';
import { Product } from '../types/product.types';
import { ApiResponse } from '../types/api.types';
import { INITIAL_PRODUCTS } from '../utils/constants';

export const wishlistApi = {
  getWishlist: async (): Promise<ApiResponse<Product[]>> => {
    try {
      const response = await api.get('/wishlist');
      return response.data;
    } catch {
      const stored = localStorage.getItem('dealkart_wishlist');
      const ids: string[] = stored ? JSON.parse(stored) : ['prod-1', 'prod-3'];
      const items = INITIAL_PRODUCTS.filter((p) => ids.includes(p.id));
      return {
        success: true,
        data: items,
      };
    }
  },

  addToWishlist: async (productId: string): Promise<ApiResponse<boolean>> => {
    try {
      const response = await api.post('/wishlist', { productId });
      return response.data;
    } catch {
      return { success: true, data: true };
    }
  },

  removeFromWishlist: async (productId: string): Promise<ApiResponse<boolean>> => {
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      return response.data;
    } catch {
      return { success: true, data: true };
    }
  },
};
