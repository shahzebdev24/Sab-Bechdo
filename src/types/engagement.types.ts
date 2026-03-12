/**
 * Engagement Types (Likes, Comments, Follows)
 */

import { User } from './auth.types';

// Likes
export interface LikeStatusResponse {
  liked: boolean;
  likesCount: number;
}

// Comments
export interface Comment {
  id: string;
  ad: string;
  user: User;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  adId: string;
  text: string;
}

export interface PaginatedCommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Follows
export interface FollowStatusResponse {
  following: boolean;
}

export interface FollowStatsResponse {
  followersCount: number;
  followingCount: number;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
