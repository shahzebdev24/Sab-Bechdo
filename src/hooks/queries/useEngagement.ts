/**
 * Engagement Query Hooks (Likes, Comments, Follows)
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { engagementService } from '../../api';
import { queryKeys } from './queryKeys';

// ============ LIKES ============

/**
 * Get like status for an ad
 */
export const useLikeStatus = (adId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.engagement.likeStatus(adId),
    queryFn: () => engagementService.getLikeStatus(adId),
    enabled: enabled && !!adId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// ============ COMMENTS ============

/**
 * List comments for an ad
 */
export const useComments = (
  adId: string,
  params?: { page?: number; limit?: number },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.engagement.comments(adId, params),
    queryFn: () => engagementService.listComments(adId, params),
    enabled: enabled && !!adId,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Infinite scroll for comments
 */
export const useCommentsInfinite = (
  adId: string,
  params?: { limit?: number },
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.engagement.comments(adId, params),
    queryFn: ({ pageParam = 1 }) => engagementService.listComments(adId, { ...params, page: pageParam }),
    enabled: enabled && !!adId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 1 * 60 * 1000,
  });
};

// ============ FOLLOWS ============

/**
 * Get follow status for a user
 */
export const useFollowStatus = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.engagement.followStatus(userId),
    queryFn: () => engagementService.getFollowStatus(userId),
    enabled: enabled && !!userId,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

/**
 * List user's followers
 */
export const useFollowers = (
  userId: string,
  params?: { page?: number; limit?: number },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.engagement.followers(userId, params),
    queryFn: () => engagementService.listFollowers(userId, params),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Infinite scroll for followers
 */
export const useFollowersInfinite = (
  userId: string,
  params?: { limit?: number },
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.engagement.followers(userId, params),
    queryFn: ({ pageParam = 1 }) => engagementService.listFollowers(userId, { ...params, page: pageParam }),
    enabled: enabled && !!userId,
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
 * List users that a user follows
 */
export const useFollowing = (
  userId: string,
  params?: { page?: number; limit?: number },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.engagement.following(userId, params),
    queryFn: () => engagementService.listFollowing(userId, params),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Infinite scroll for following
 */
export const useFollowingInfinite = (
  userId: string,
  params?: { limit?: number },
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.engagement.following(userId, params),
    queryFn: ({ pageParam = 1 }) => engagementService.listFollowing(userId, { ...params, page: pageParam }),
    enabled: enabled && !!userId,
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
 * Get follow stats for a user
 */
export const useFollowStats = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.engagement.followStats(userId),
    queryFn: () => engagementService.getFollowStats(userId),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000,
  });
};
