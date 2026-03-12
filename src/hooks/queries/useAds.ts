/**
 * Ads Query Hooks
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { adsService } from '../../api';
import { queryKeys } from './queryKeys';
import type { AdFilters } from '../../types';

/**
 * List ads with filters
 */
export const useAdsList = (filters?: AdFilters, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.ads.list(filters),
    queryFn: () => adsService.listAds(filters),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Infinite scroll for ads list
 */
export const useAdsListInfinite = (filters?: Omit<AdFilters, 'page'>, enabled = true) => {
  return useInfiniteQuery({
    queryKey: queryKeys.ads.list(filters),
    queryFn: ({ pageParam = 1 }) => adsService.listAds({ ...filters, page: pageParam }),
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

/**
 * List reels (ads with video)
 */
export const useReelsList = (filters?: Omit<AdFilters, 'sort'>, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.ads.reels(filters),
    queryFn: () => adsService.listReels(filters),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Infinite scroll for reels
 */
export const useReelsListInfinite = (filters?: Omit<AdFilters, 'sort' | 'page'>, enabled = true) => {
  return useInfiniteQuery({
    queryKey: queryKeys.ads.reels(filters),
    queryFn: ({ pageParam = 1 }) => adsService.listReels({ ...filters, page: pageParam }),
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

/**
 * Get single ad details
 */
export const useAdDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.ads.detail(id),
    queryFn: () => adsService.getAd(id),
    enabled: enabled && !!id,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Get ads by seller
 */
export const useSellerAds = (
  sellerId: string,
  params?: { page?: number; limit?: number; sort?: string },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.ads.sellerAds(sellerId, params),
    queryFn: () => adsService.getSellerAds(sellerId, params),
    enabled: enabled && !!sellerId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Infinite scroll for seller ads
 */
export const useSellerAdsInfinite = (
  sellerId: string,
  params?: { limit?: number; sort?: string },
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.ads.sellerAds(sellerId, params),
    queryFn: ({ pageParam = 1 }) => adsService.getSellerAds(sellerId, { ...params, page: pageParam }),
    enabled: enabled && !!sellerId,
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

/**
 * Get current user's own ads
 */
export const useMyAds = (
  params?: { page?: number; limit?: number; sort?: string },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.ads.myAds(params),
    queryFn: () => adsService.getMyAds(params),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};
