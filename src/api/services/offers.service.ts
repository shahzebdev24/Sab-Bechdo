/**
 * Offers Service
 * All offer-related API calls
 */

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  Offer,
  CreateOfferRequest,
  UpdateOfferStatusRequest,
  PaginatedOffersResponse,
  ApiSuccessResponse,
} from '../../types';

/**
 * Create an offer
 */
export const createOffer = async (data: CreateOfferRequest): Promise<Offer> => {
  const response = await apiClient.post<any, ApiSuccessResponse<Offer>>(
    ENDPOINTS.OFFERS.CREATE,
    data
  );
  return response.data;
};

/**
 * List offers sent by current user
 */
export const listSentOffers = async (params?: { page?: number; limit?: number }): Promise<PaginatedOffersResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedOffersResponse>>(
    ENDPOINTS.OFFERS.SENT,
    { params }
  );
  return response.data;
};

/**
 * List offers received by current user
 */
export const listReceivedOffers = async (params?: { page?: number; limit?: number }): Promise<PaginatedOffersResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedOffersResponse>>(
    ENDPOINTS.OFFERS.RECEIVED,
    { params }
  );
  return response.data;
};

/**
 * List offers for a specific ad
 */
export const listOffersByAd = async (
  adId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedOffersResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedOffersResponse>>(
    ENDPOINTS.OFFERS.BY_AD(adId),
    { params }
  );
  return response.data;
};

/**
 * Update offer status
 */
export const updateOfferStatus = async (offerId: string, data: UpdateOfferStatusRequest): Promise<Offer> => {
  const response = await apiClient.patch<any, ApiSuccessResponse<Offer>>(
    ENDPOINTS.OFFERS.UPDATE_STATUS(offerId),
    data
  );
  return response.data;
};
