/**
 * Reviews Service
 * All review-related API calls
 */

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  Review,
  CreateReviewRequest,
  PaginatedReviewsResponse,
  ApiSuccessResponse,
} from '../../types';

/**
 * Create a review
 */
export const createReview = async (data: CreateReviewRequest): Promise<Review> => {
  const response = await apiClient.post<any, ApiSuccessResponse<Review>>(
    ENDPOINTS.REVIEWS.CREATE,
    data
  );
  return response.data;
};

/**
 * Get reviews for a seller
 */
export const getSellerReviews = async (
  sellerId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedReviewsResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedReviewsResponse>>(
    ENDPOINTS.REVIEWS.SELLER_REVIEWS(sellerId),
    { params }
  );
  return response.data;
};
