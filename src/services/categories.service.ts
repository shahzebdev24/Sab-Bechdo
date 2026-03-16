/**
 * Categories Service
 * API calls for categories
 */

import apiClient from '../api/client';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  isActive: boolean;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
  };
}

/**
 * Get all active categories
 */
export const getActiveCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<CategoriesResponse>('/categories');
  return response.data.categories;
};
