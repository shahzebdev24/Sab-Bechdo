/**
 * Engagement Service
 * All engagement-related API calls (likes, comments, follows)
 */

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  LikeStatusResponse,
  Comment,
  CreateCommentRequest,
  PaginatedCommentsResponse,
  FollowStatusResponse,
  FollowStatsResponse,
  PaginatedUsersResponse,
  ApiSuccessResponse,
} from '../../types';

// ============ LIKES ============

/**
 * Like an ad
 */
export const likeAd = async (adId: string): Promise<LikeStatusResponse> => {
  const response = await apiClient.post<any, ApiSuccessResponse<{ liked: boolean; likesCount: number }>>(
    ENDPOINTS.ENGAGEMENT.LIKE(adId)
  );
  
  // Map backend response to frontend format
  return {
    liked: response.data.liked,
    likesCount: response.data.likesCount
  };
};

/**
 * Unlike an ad
 */
export const unlikeAd = async (adId: string): Promise<LikeStatusResponse> => {
  const response = await apiClient.delete<any, ApiSuccessResponse<{ unliked: boolean; likesCount: number }>>(
    ENDPOINTS.ENGAGEMENT.UNLIKE(adId)
  );
  
  // Map backend response to frontend format
  return {
    liked: !response.data.unliked, // If unliked successfully, liked = false
    likesCount: response.data.likesCount
  };
};

/**
 * Check if user liked an ad and get like count
 */
export const getLikeStatus = async (adId: string): Promise<LikeStatusResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<{ isLiked: boolean; likesCount: number }>>(
    ENDPOINTS.ENGAGEMENT.LIKE_STATUS(adId)
  );
  
  // Map backend response to frontend format
  return {
    liked: response.data.isLiked,
    likesCount: response.data.likesCount
  };
};

// ============ COMMENTS ============

/**
 * List comments for an ad
 */
export const listComments = async (
  adId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedCommentsResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedCommentsResponse>>(
    ENDPOINTS.ENGAGEMENT.COMMENTS_LIST(adId),
    { params }
  );
  return response.data;
};

/**
 * Create a comment
 */
export const createComment = async (data: CreateCommentRequest): Promise<Comment> => {
  const response = await apiClient.post<any, ApiSuccessResponse<Comment>>(
    ENDPOINTS.ENGAGEMENT.COMMENT_CREATE(data.adId),
    { text: data.text }
  );
  return response.data;
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.ENGAGEMENT.COMMENT_DELETE(commentId));
};

// ============ FOLLOWS ============

/**
 * Follow a user
 */
export const followUser = async (userId: string): Promise<FollowStatusResponse> => {
  const response = await apiClient.post<any, ApiSuccessResponse<any>>(
    ENDPOINTS.ENGAGEMENT.FOLLOW(userId)
  );
  
  // Map backend response to frontend format
  return {
    following: response.data.followed ?? response.data.following ?? true
  };
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (userId: string): Promise<FollowStatusResponse> => {
  const response = await apiClient.delete<any, ApiSuccessResponse<any>>(
    ENDPOINTS.ENGAGEMENT.UNFOLLOW(userId)
  );
  
  // Map backend response to frontend format
  return {
    following: response.data.followed ?? response.data.following ?? false
  };
};

/**
 * Check if user is following another user
 */
export const getFollowStatus = async (userId: string): Promise<FollowStatusResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<any>>(
    ENDPOINTS.ENGAGEMENT.FOLLOW_STATUS(userId)
  );
  
  // Map backend response to frontend format
  return {
    following: response.data.isFollowing ?? response.data.followed ?? response.data.following ?? false
  };
};

/**
 * List user's followers
 */
export const listFollowers = async (
  userId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedUsersResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedUsersResponse>>(
    ENDPOINTS.ENGAGEMENT.FOLLOWERS(userId),
    { params }
  );
  return response.data;
};

/**
 * List users that a user follows
 */
export const listFollowing = async (
  userId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedUsersResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedUsersResponse>>(
    ENDPOINTS.ENGAGEMENT.FOLLOWING(userId),
    { params }
  );
  return response.data;
};

/**
 * Get follow stats for a user
 */
export const getFollowStats = async (userId: string): Promise<FollowStatsResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<FollowStatsResponse>>(
    ENDPOINTS.ENGAGEMENT.FOLLOW_STATS(userId)
  );
  return response.data;
};
