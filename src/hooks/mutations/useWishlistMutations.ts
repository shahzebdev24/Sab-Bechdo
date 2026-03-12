/**
 * Wishlist Mutation Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '../../api';
import { queryKeys } from '../queries/queryKeys';

/**
 * Add ad to wishlist
 */
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: string) => wishlistService.addToWishlist(adId),
    onSuccess: (_, adId) => {
      // Invalidate ALL queries to force refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ads.all });
      
      // Optimistically update ad detail if it's in cache
      queryClient.setQueryData(queryKeys.ads.detail(adId), (oldData: any) => {
        if (oldData) {
          return { ...oldData, isFavorite: true };
        }
        return oldData;
      });
    },
  });
};

/**
 * Remove ad from wishlist
 */
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: string) => wishlistService.removeFromWishlist(adId),
    onSuccess: (_, adId) => {
      // Invalidate ALL queries to force refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ads.all });
      
      // Optimistically update ad detail if it's in cache
      queryClient.setQueryData(queryKeys.ads.detail(adId), (oldData: any) => {
        if (oldData) {
          return { ...oldData, isFavorite: false };
        }
        return oldData;
      });
    },
  });
};

/**
 * Toggle wishlist (add or remove)
 */
export const useToggleWishlist = () => {
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  return {
    toggle: (adId: string, isFavorite: boolean) => {
      if (isFavorite) {
        return removeFromWishlist.mutateAsync(adId);
      } else {
        return addToWishlist.mutateAsync(adId);
      }
    },
    isLoading: addToWishlist.isPending || removeFromWishlist.isPending,
  };
};
