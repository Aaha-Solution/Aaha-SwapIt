import api from './axiosInstance';
import { Product, ProductFilterOptions, SearchSuggestionResult } from '../types/product.types';
import { ApiResponse } from '../types/api.types';
import { INITIAL_PRODUCTS, CATEGORIES } from '../utils/constants';

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
        const q = filters.search.toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.city.toLowerCase().includes(q)
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

      if (filters?.condition && filters.condition !== 'all') {
        filtered = filtered.filter(
          (p) => p.condition?.toLowerCase() === filters.condition?.toLowerCase()
        );
      }

      if (filters?.minPrice !== undefined) {
        filtered = filtered.filter((p) => p.price >= filters.minPrice!);
      }

      if (filters?.maxPrice !== undefined) {
        filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
      }

      if (filters?.sortBy === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (filters?.sortBy === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (filters?.sortBy === 'views-desc' || filters?.sortBy === 'views') {
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      } else if (filters?.sortBy === 'featured') {
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
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

  getSuggestions: async (q: string): Promise<ApiResponse<SearchSuggestionResult>> => {
    try {
      const response = await api.get('/products/suggestions', { params: { q } });
      return response.data;
    } catch {
      const query = q.toLowerCase().trim();
      if (!query) {
        return { success: true, data: { products: [], categories: [] } };
      }

      const matchingProds = localProducts
        .filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        )
        .slice(0, 6)
        .map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          categoryName: p.category,
          imageUrl: p.imageUrl,
        }));

      const matchingCats = CATEGORIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.slug.toLowerCase().includes(query)
      )
        .slice(0, 4)
        .map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.iconName,
        }));

      return {
        success: true,
        data: {
          products: matchingProds,
          categories: matchingCats,
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

  updateProduct: async (
    id: string,
    productData: Partial<Product>
  ): Promise<ApiResponse<Product>> => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch {
      const idx = localProducts.findIndex((p) => p.id === id);
      if (idx !== -1) {
        localProducts[idx] = {
          ...localProducts[idx],
          ...productData,
        };
        return {
          success: true,
          data: localProducts[idx],
        };
      }
      return {
        success: false,
        message: 'Product not found',
        data: null as any,
      };
    }
  },

  updateProductStatus: async (
    id: string,
    status: 'active' | 'sold'
  ): Promise<ApiResponse<Product>> => {
    try {
      const response = await api.patch(`/products/${id}/status`, { status });
      return response.data;
    } catch {
      const idx = localProducts.findIndex((p) => p.id === id);
      if (idx !== -1) {
        localProducts[idx] = {
          ...localProducts[idx],
          status,
        };
        return {
          success: true,
          data: localProducts[idx],
        };
      }
      return {
        success: false,
        message: 'Product not found',
        data: null as any,
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
