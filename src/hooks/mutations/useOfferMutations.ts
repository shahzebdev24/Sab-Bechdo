/**
 * Offer Mutation Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { offersService } from '../../api';
import { queryKeys } from '../queries/queryKeys';
import type { CreateOfferRequest, UpdateOfferStatusRequest } from '../../types';

/**
 * Create an offer
 */
export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfferRequest) => offersService.createOffer(data),
    onSuccess: (newOffer, variables) => {
      // Invalidate sent offers
      queryClient.invalidateQueries({ 
        queryKey: ['offers', 'sent'] 
      });
      
      // Invalidate offers by ad
      queryClient.invalidateQueries({ 
        queryKey: ['offers', 'ad', variables.adId] 
      });
    },
  });
};

/**
 * Update offer status
 */
export const useUpdateOfferStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, data }: { offerId: string; data: UpdateOfferStatusRequest }) => 
      offersService.updateOfferStatus(offerId, data),
    onSuccess: () => {
      // Invalidate all offer queries
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all });
    },
  });
};
