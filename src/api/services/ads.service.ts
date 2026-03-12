/**
 * Ads Service
 * All ad-related API calls
 */

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  Ad,
  AdFilters,
  PaginatedAdsResponse,
  CreateAdRequest,
  UpdateAdRequest,
  UpdateAdStatusRequest,
  ApiSuccessResponse,
} from '../../types';

/**
 * List ads with filters
 */
export const listAds = async (filters?: AdFilters): Promise<PaginatedAdsResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedAdsResponse>>(
    ENDPOINTS.ADS.LIST,
    { params: filters }
  );
  return response.data;
};

/**
 * List ads with video (reels feed)
 */
export const listReels = async (filters?: Omit<AdFilters, 'sort'>): Promise<PaginatedAdsResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedAdsResponse>>(
    ENDPOINTS.ADS.REELS,
    { params: filters }
  );
  return response.data;
};

/**
 * Get single ad details
 */
export const getAd = async (id: string): Promise<Ad> => {
  const response = await apiClient.get<any, ApiSuccessResponse<Ad>>(
    ENDPOINTS.ADS.DETAIL(id)
  );
  return response.data;
};

/**
 * Get ads by seller
 */
export const getSellerAds = async (
  sellerId: string,
  params?: { page?: number; limit?: number; sort?: string }
): Promise<PaginatedAdsResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedAdsResponse>>(
    ENDPOINTS.ADS.SELLER_ADS(sellerId),
    { params }
  );
  return response.data;
};

/**
 * Create new ad
 */
export const createAd = async (data: CreateAdRequest): Promise<Ad> => {
  const response = await apiClient.post<any, ApiSuccessResponse<Ad>>(
    ENDPOINTS.ADS.CREATE,
    data
  );
  return response.data;
};

/**
 * Update ad
 */
export const updateAd = async (id: string, data: UpdateAdRequest): Promise<Ad> => {
  const response = await apiClient.patch<any, ApiSuccessResponse<Ad>>(
    ENDPOINTS.ADS.UPDATE(id),
    data
  );
  return response.data;
};

/**
 * Update ad status
 */
export const updateAdStatus = async (id: string, data: UpdateAdStatusRequest): Promise<Ad> => {
  const response = await apiClient.patch<any, ApiSuccessResponse<Ad>>(
    ENDPOINTS.ADS.UPDATE_STATUS(id),
    data
  );
  return response.data;
};

/**
 * Delete ad
 */
export const deleteAd = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.ADS.DELETE(id));
};

/**
 * Get current user's own ads
 */
export const getMyAds = async (
  params?: { page?: number; limit?: number; sort?: string }
): Promise<PaginatedAdsResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedAdsResponse>>(
    ENDPOINTS.ADS.MY_ADS,
    { params }
  );
  return response.data;
};
