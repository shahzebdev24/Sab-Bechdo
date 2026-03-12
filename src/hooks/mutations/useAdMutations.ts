/**
 * Ad Mutation Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adsService } from '../../api';
import { queryKeys } from '../queries/queryKeys';
import type { CreateAdRequest, UpdateAdRequest, UpdateAdStatusRequest } from '../../types';

/**
 * Create new ad
 */
export const useCreateAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdRequest) => adsService.createAd(data),
    onSuccess: (newAd) => {
      // Invalidate ads lists
      queryClient.invalidateQueries({ queryKey: queryKeys.ads.all });
      
      // Invalidate seller ads if owner ID is available
      if (typeof newAd.owner !== 'string') {
        queryClient.invalidateQueries({ 
          queryKey: ['ads', 'seller', newAd.owner.id] 
        });
      }
    },
  });
};

/**
 * Update ad
 */
export const useUpdateAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdRequest }) => 
      adsService.updateAd(id, data),
    onSuccess: (updatedAd, variables) => {
      // Update ad detail cache
      queryClient.setQueryData(queryKeys.ads.detail(variables.id), updatedAd);
      
      // Invalidate ads lists
      queryClient.invalidateQueries({ queryKey: queryKeys.ads.all });
      
      // Invalidate seller ads
      if (typeof updatedAd.owner !== 'string') {
        queryClient.invalidateQueries({ 
          queryKey: ['ads', 'seller', updatedAd.owner.id] 
        });
      }
    },
  });
};

/**
 * Update ad status
 */
export const useUpdateAdStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdStatusRequest }) => 
      adsService.updateAdStatus(id, data),
    onSuccess: (updatedAd, variables) => {
      // Update ad detail cache
      queryClient.setQueryData(queryKeys.ads.detail(variables.id), updatedAd);
      
      // Invalidate ads lists
      queryClient.invalidateQueries({ queryKey: queryKeys.ads.all });
      
      // Invalidate seller ads
      if (typeof updatedAd.owner !== 'string') {
        queryClient.invalidateQueries({ 
          queryKey: ['ads', 'seller', updatedAd.owner.id] 
        });
      }
    },
  });
};

/**
 * Delete ad
 */
export const useDeleteAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adsService.deleteAd(id),
    onSuccess: (_, deletedAdId) => {
      // Remove from ad detail cache
      queryClient.removeQueries({ queryKey: queryKeys.ads.detail(deletedAdId) });
      
      // Invalidate all ads lists
      queryClient.invalidateQueries({ queryKey: queryKeys.ads.all });
    },
  });
};
