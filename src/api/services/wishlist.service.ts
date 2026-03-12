/**
 * Wishlist Service
 * All wishlist-related API calls
 */

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type { PaginatedAdsResponse, ApiSuccessResponse } from '../../types';

/**
 * Get user's wishlist
 */
export const getWishlist = async (params?: { page?: number; limit?: number }): Promise<PaginatedAdsResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedAdsResponse>>(
    ENDPOINTS.WISHLIST.LIST,
    { params }
  );
  return response.data;
};

/**
 * Add ad to wishlist
 */
export const addToWishlist = async (adId: string): Promise<void> => {
  await apiClient.post(ENDPOINTS.WISHLIST.ADD(adId));
};

/**
 * Remove ad from wishlist
 */
export const removeFromWishlist = async (adId: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.WISHLIST.REMOVE(adId));
};
