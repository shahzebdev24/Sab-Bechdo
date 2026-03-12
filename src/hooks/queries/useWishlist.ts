/**
 * Wishlist Query Hooks
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { wishlistService } from '../../api';
import { queryKeys } from './queryKeys';

/**
 * Get user's wishlist
 */
export const useWishlist = (params?: { page?: number; limit?: number }, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.wishlist.list(params),
    queryFn: () => wishlistService.getWishlist(params),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Infinite scroll for wishlist
 */
export const useWishlistInfinite = (params?: { limit?: number }, enabled = true) => {
  return useInfiniteQuery({
    queryKey: queryKeys.wishlist.list(params),
    queryFn: ({ pageParam = 1 }) => wishlistService.getWishlist({ ...params, page: pageParam }),
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000,
  });
};
