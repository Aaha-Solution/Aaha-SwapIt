import api from './axiosInstance';
import { Category } from '../types/category.types';
import { ApiResponse } from '../types/api.types';
import { CATEGORIES } from '../utils/constants';

export const categoryApi = {
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch {
      return {
        success: true,
        data: CATEGORIES,
      };
    }
  },

  getCategoryBySlug: async (slug: string): Promise<ApiResponse<Category | null>> => {
    try {
      const response = await api.get(`/categories/${slug}`);
      return response.data;
    } catch {
      const category = CATEGORIES.find((c) => c.slug === slug) || null;
      return {
        success: !!category,
        data: category,
      };
    }
  },
};
