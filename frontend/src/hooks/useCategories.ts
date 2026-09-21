import { useState, useEffect } from 'react';
import { Category } from '../types/category.types';
import { categoryApi } from '../api/category.api';
import { CATEGORIES } from '../utils/constants';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await categoryApi.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch {
        // Fallback to local categories
        setCategories(CATEGORIES);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return { categories, isLoading };
}
