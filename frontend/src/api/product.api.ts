import api from './axiosInstance';
import { Product, ProductFilterOptions } from '../types/product.types';
import { ApiResponse } from '../types/api.types';
import { INITIAL_PRODUCTS } from '../utils/constants';

// Local cache for products when running standalone
let localProducts: Product[] = [...INITIAL_PRODUCTS];

export const productApi = {
  getProducts: async (filters?: ProductFilterOptions): Promise<ApiResponse<Product[]>> => {
    try {
      const response = await api.get('/products', { params: filters });
      return response.data;
    } catch {
      let filtered = [...localProducts];

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }

      if (filters?.category && filters.category !== 'all') {
        filtered = filtered.filter(
          (p) => p.category.toLowerCase() === filters.category?.toLowerCase()
        );
      }

      if (filters?.city && filters.city !== 'all') {
        filtered = filtered.filter(
          (p) => p.city.toLowerCase() === filters.city?.toLowerCase()
        );
      }

      if (filters?.sortBy === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (filters?.sortBy === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      }

      return {
        success: true,
        data: filtered,
        meta: {
          total: filtered.length,
          page: filters?.page || 1,
          limit: filters?.limit || 12,
          totalPages: 1,
        },
      };
    }
  },

  getProductById: async (id: string): Promise<ApiResponse<Product | null>> => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch {
      const product = localProducts.find((p) => p.id === id) || null;
      return {
        success: !!product,
        data: product,
      };
    }
  },

  createProduct: async (productData: Partial<Product>): Promise<ApiResponse<Product>> => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        title: productData.title || 'Untitled Product',
        price: productData.price || 0,
        description: productData.description || '',
        category: productData.category || 'electronics',
        city: productData.city || 'Chennai',
        location: `${productData.city || 'Chennai'} • Just now`,
        postedAt: 'Just now',
        condition: productData.condition || 'Good',
        imageUrl: productData.imageUrl || '/images/laptop_macbook.png',
        images: [productData.imageUrl || '/images/laptop_macbook.png'],
        featured: false,
        status: 'active',
        seller: {
          id: 'usr-current',
          name: 'You',
          phone: productData.seller?.phone || '+91 98401 23456',
          memberSince: 'Sep 2026',
          rating: 5.0,
          verified: true,
        },
      };

      localProducts = [newProduct, ...localProducts];
      return {
        success: true,
        data: newProduct,
      };
    }
  },

  deleteProduct: async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch {
      localProducts = localProducts.filter((p) => p.id !== id);
      return { success: true, data: true };
    }
  },
};
