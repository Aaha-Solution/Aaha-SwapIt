import api from './axiosInstance';
import { ApiResponse } from '../types/api.types';
import { CITIES } from '../utils/constants';

export const locationApi = {
  getCities: async (): Promise<ApiResponse<string[]>> => {
    try {
      const response = await api.get('/locations');
      return response.data;
    } catch {
      return {
        success: true,
        data: CITIES,
      };
    }
  },
};
