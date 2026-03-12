/**
 * Engagement Mutation Hooks (Likes, Comments, Follows)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { engagementService } from '../../api';
import { queryKeys } from '../queries/queryKeys';
import type { CreateCommentRequest } from '../../types';

// ============ LIKES ============

/**
 * Like an ad
 */
export const useLikeAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: string) => engagementService.likeAd(adId),
    onSuccess: (response, adId) => {
      // Update like status cache
      queryClient.setQueryData(queryKeys.engagement.likeStatus(adId), response);
      
      // Optionally update ad detail cache with new like count
      queryClient.setQueryData(queryKeys.ads.detail(adId), (oldData: any) => {
        if (oldData) {
          return { ...oldData, likesCount: response.likesCount };
        }
        return oldData;
      });
    },
  });
};

/**
 * Unlike an ad
 */
export const useUnlikeAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adId: string) => engagementService.unlikeAd(adId),
    onSuccess: (response, adId) => {
      // Update like status cache
      queryClient.setQueryData(queryKeys.engagement.likeStatus(adId), response);
      
      // Optionally update ad detail cache with new like count
      queryClient.setQueryData(queryKeys.ads.detail(adId), (oldData: any) => {
        if (oldData) {
          return { ...oldData, likesCount: response.likesCount };
        }
        return oldData;
      });
    },
  });
};

/**
 * Toggle like (like or unlike)
 */
export const useToggleLike = () => {
  const likeAd = useLikeAd();
  const unlikeAd = useUnlikeAd();

  return {
    toggle: (adId: string, isLiked: boolean) => {
      if (isLiked) {
        return unlikeAd.mutateAsync(adId);
      } else {
        return likeAd.mutateAsync(adId);
      }
    },
    isLoading: likeAd.isPending || unlikeAd.isPending,
  };
};

// ============ COMMENTS ============

/**
 * Create a comment
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => engagementService.createComment(data),
    onSuccess: (newComment, variables) => {
      // Invalidate comments list for the ad
      queryClient.invalidateQueries({ 
        queryKey: ['engagement', 'comments', variables.adId] 
      });
    },
  });
};

/**
 * Delete a comment
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => engagementService.deleteComment(commentId),
    onSuccess: () => {
      // Invalidate all comments queries (we don't know which ad it belongs to)
      queryClient.invalidateQueries({ 
        queryKey: ['engagement', 'comments'] 
      });
    },
  });
};

// ============ FOLLOWS ============

/**
 * Follow a user
 */
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => engagementService.followUser(userId),
    onSuccess: (response, userId) => {
      // Update follow status cache
      queryClient.setQueryData(queryKeys.engagement.followStatus(userId), response);
      
      // Invalidate follow stats
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.engagement.followStats(userId) 
      });
      
      // Invalidate followers/following lists
      queryClient.invalidateQueries({ 
        queryKey: ['engagement', 'followers'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['engagement', 'following'] 
      });
      
      // Invalidate seller profile
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.seller(userId) 
      });
    },
  });
};

/**
 * Unfollow a user
 */
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => engagementService.unfollowUser(userId),
    onSuccess: (response, userId) => {
      // Update follow status cache
      queryClient.setQueryData(queryKeys.engagement.followStatus(userId), response);
      
      // Invalidate follow stats
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.engagement.followStats(userId) 
      });
      
      // Invalidate followers/following lists
      queryClient.invalidateQueries({ 
        queryKey: ['engagement', 'followers'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['engagement', 'following'] 
      });
      
      // Invalidate seller profile
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.seller(userId) 
      });
    },
  });
};

/**
 * Toggle follow (follow or unfollow)
 */
export const useToggleFollow = () => {
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  return {
    toggle: (userId: string, isFollowing: boolean) => {
      if (isFollowing) {
        return unfollowUser.mutateAsync(userId);
      } else {
        return followUser.mutateAsync(userId);
      }
    },
    isLoading: followUser.isPending || unfollowUser.isPending,
  };
};
