/**
 * Query Keys
 * Centralized query key definitions for React Query
 */

import type { AdFilters } from '../../types';

export const queryKeys = {
  // Auth
  auth: {
    profile: ['auth', 'profile'] as const,
  },

  // Users
  users: {
    me: ['users', 'me'] as const,
    preferences: ['users', 'preferences'] as const,
    seller: (id: string) => ['users', 'seller', id] as const,
  },

  // Ads
  ads: {
    all: ['ads'] as const,
    list: (filters?: AdFilters) => ['ads', 'list', filters] as const,
    reels: (filters?: Omit<AdFilters, 'sort'>) => ['ads', 'reels', filters] as const,
    detail: (id: string) => ['ads', 'detail', id] as const,
    sellerAds: (sellerId: string, params?: any) => ['ads', 'seller', sellerId, params] as const,
    myAds: (params?: any) => ['ads', 'my-ads', params] as const,
  },

  // Wishlist
  wishlist: {
    all: ['wishlist'] as const,
    list: (params?: any) => ['wishlist', 'list', params] as const,
  },

  // Reviews
  reviews: {
    all: ['reviews'] as const,
    seller: (sellerId: string, params?: any) => ['reviews', 'seller', sellerId, params] as const,
  },

  // Engagement
  engagement: {
    // Likes
    likeStatus: (adId: string) => ['engagement', 'likes', 'status', adId] as const,
    
    // Comments
    comments: (adId: string, params?: any) => ['engagement', 'comments', adId, params] as const,
    
    // Follows
    followStatus: (userId: string) => ['engagement', 'follows', 'status', userId] as const,
    followers: (userId: string, params?: any) => ['engagement', 'followers', userId, params] as const,
    following: (userId: string, params?: any) => ['engagement', 'following', userId, params] as const,
    followStats: (userId: string) => ['engagement', 'stats', userId] as const,
  },

  // Chat
  chat: {
    all: ['chat'] as const,
    conversations: (params?: any) => ['chat', 'conversations', params] as const,
    conversation: (id: string) => ['chat', 'conversation', id] as const,
    messages: (conversationId: string, params?: any) => ['chat', 'messages', conversationId, params] as const,
    unreadCounts: ['chat', 'unread-counts'] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (params?: any) => ['notifications', 'list', params] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },

  // Offers
  offers: {
    all: ['offers'] as const,
    sent: (params?: any) => ['offers', 'sent', params] as const,
    received: (params?: any) => ['offers', 'received', params] as const,
    byAd: (adId: string, params?: any) => ['offers', 'ad', adId, params] as const,
  },
} as const;
