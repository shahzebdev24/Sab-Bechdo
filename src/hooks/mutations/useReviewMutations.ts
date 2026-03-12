/**
 * Review Mutation Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '../../api';
import { queryKeys } from '../queries/queryKeys';
import type { CreateReviewRequest } from '../../types';

/**
 * Create a review
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => reviewsService.createReview(data),
    onSuccess: (newReview, variables) => {
      // Invalidate seller reviews
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'seller', variables.sellerId] 
      });
      
      // Invalidate seller profile to update rating
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.seller(variables.sellerId) 
      });
    },
  });
};
