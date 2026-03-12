/**
 * Reviews Query Hooks
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { reviewsService } from '../../api';
import { queryKeys } from './queryKeys';

/**
 * Get reviews for a seller
 */
export const useSellerReviews = (
  sellerId: string,
  params?: { page?: number; limit?: number },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.reviews.seller(sellerId, params),
    queryFn: () => reviewsService.getSellerReviews(sellerId, params),
    enabled: enabled && !!sellerId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Infinite scroll for seller reviews
 */
export const useSellerReviewsInfinite = (
  sellerId: string,
  params?: { limit?: number },
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.reviews.seller(sellerId, params),
    queryFn: ({ pageParam = 1 }) => reviewsService.getSellerReviews(sellerId, { ...params, page: pageParam }),
    enabled: enabled && !!sellerId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 3 * 60 * 1000,
  });
};
