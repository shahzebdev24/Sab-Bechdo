/**
 * Categories Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { getActiveCategories, Category } from '@/src/services/categories.service';

/**
 * Get all active categories
 */
export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getActiveCategories,
    staleTime: 1000 * 60 * 60, // 1 hour - categories don't change often
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
