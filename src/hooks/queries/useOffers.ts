/**
 * Offers Query Hooks
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { offersService } from '../../api';
import { queryKeys } from './queryKeys';

/**
 * List offers sent by current user
 */
export const useSentOffers = (params?: { page?: number; limit?: number }, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.offers.sent(params),
    queryFn: () => offersService.listSentOffers(params),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Infinite scroll for sent offers
 */
export const useSentOffersInfinite = (params?: { limit?: number }, enabled = true) => {
  return useInfiniteQuery({
    queryKey: queryKeys.offers.sent(params),
    queryFn: ({ pageParam = 1 }) => offersService.listSentOffers({ ...params, page: pageParam }),
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
 * List offers received by current user
 */
export const useReceivedOffers = (params?: { page?: number; limit?: number }, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.offers.received(params),
    queryFn: () => offersService.listReceivedOffers(params),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Infinite scroll for received offers
 */
export const useReceivedOffersInfinite = (params?: { limit?: number }, enabled = true) => {
  return useInfiniteQuery({
    queryKey: queryKeys.offers.received(params),
    queryFn: ({ pageParam = 1 }) => offersService.listReceivedOffers({ ...params, page: pageParam }),
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
 * List offers for a specific ad
 */
export const useOffersByAd = (
  adId: string,
  params?: { page?: number; limit?: number },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.offers.byAd(adId, params),
    queryFn: () => offersService.listOffersByAd(adId, params),
    enabled: enabled && !!adId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Infinite scroll for offers by ad
 */
export const useOffersByAdInfinite = (
  adId: string,
  params?: { limit?: number },
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.offers.byAd(adId, params),
    queryFn: ({ pageParam = 1 }) => offersService.listOffersByAd(adId, { ...params, page: pageParam }),
    enabled: enabled && !!adId,
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
