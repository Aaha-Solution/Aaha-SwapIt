import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Product } from '../types/product.types';
import { productApi } from '../api/product.api';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    searchQuery,
    selectedCategory,
    selectedCity,
    sortBy,
    priceRange,
    customMinPrice,
    customMaxPrice,
    selectedCondition,
  } = useSelector((state: RootState) => state.user);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let minPrice: number | undefined;
      let maxPrice: number | undefined;

      if (priceRange === 'custom') {
        minPrice = customMinPrice !== null ? customMinPrice : undefined;
        maxPrice = customMaxPrice !== null ? customMaxPrice : undefined;
      } else if (priceRange === 'under15k' || priceRange === 'under-10k') {
        maxPrice = 15000;
      } else if (priceRange === '15k-50k' || priceRange === '10k-50k') {
        minPrice = 15000;
        maxPrice = 50000;
      } else if (priceRange === 'above50k' || priceRange === 'above-50k') {
        minPrice = 50000;
      }

      const response = await productApi.getProducts({
        search: searchQuery.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        city: selectedCity !== 'all' ? selectedCity : undefined,
        condition: selectedCondition !== 'all' ? selectedCondition : undefined,
        minPrice,
        maxPrice,
        sortBy,
      });

      if (response.success) {
        setProducts(response.data);
      }
    } catch {
      setError('Failed to load listings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    selectedCategory,
    selectedCity,
    sortBy,
    priceRange,
    customMinPrice,
    customMaxPrice,
    selectedCondition,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}
