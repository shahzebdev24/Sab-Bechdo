/**
 * API Endpoints
 * Centralized API endpoint definitions
 */

export const ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    FIREBASE: '/auth/firebase',
  },

  // Users endpoints
  USERS: {
    ME: '/users/me',
    PREFERENCES: '/users/me/preferences',
    SELLER_PROFILE: (id: string) => `/users/${id}`,
  },

  // Ads endpoints
  ADS: {
    LIST: '/ads',
    REELS: '/ads/reels',
    DETAIL: (id: string) => `/ads/${id}`,
    SELLER_ADS: (sellerId: string) => `/ads/seller/${sellerId}`,
    MY_ADS: '/ads/me',
    CREATE: '/ads',
    UPDATE: (id: string) => `/ads/${id}`,
    UPDATE_STATUS: (id: string) => `/ads/${id}/status`,
    DELETE: (id: string) => `/ads/${id}`,
  },

  // Media endpoints
  MEDIA: {
    UPLOAD: '/media/upload',
  },

  // Wishlist endpoints
  WISHLIST: {
    LIST: '/wishlist',
    ADD: (adId: string) => `/wishlist/${adId}`,
    REMOVE: (adId: string) => `/wishlist/${adId}`,
  },

  // Reviews endpoints
  REVIEWS: {
    CREATE: '/reviews',
    SELLER_REVIEWS: (sellerId: string) => `/reviews/seller/${sellerId}`,
  },

  // Engagement endpoints
  ENGAGEMENT: {
    // Likes
    LIKE: (adId: string) => `/engagement/likes/${adId}`,
    UNLIKE: (adId: string) => `/engagement/likes/${adId}`,
    LIKE_STATUS: (adId: string) => `/engagement/likes/${adId}/status`,
    
    // Comments
    COMMENTS_LIST: (adId: string) => `/engagement/comments/${adId}`,
    COMMENT_CREATE: '/engagement/comments',
    COMMENT_DELETE: (commentId: string) => `/engagement/comments/${commentId}`,
    
    // Follows
    FOLLOW: (userId: string) => `/engagement/follows/${userId}`,
    UNFOLLOW: (userId: string) => `/engagement/follows/${userId}`,
    FOLLOW_STATUS: (userId: string) => `/engagement/follows/${userId}/status`,
    FOLLOWERS: (userId: string) => `/engagement/followers/${userId}`,
    FOLLOWING: (userId: string) => `/engagement/following/${userId}`,
    FOLLOW_STATS: (userId: string) => `/engagement/stats/${userId}`,
  },

  // Chat endpoints
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    CONVERSATION_DETAIL: (id: string) => `/chat/conversations/${id}`,
    MESSAGES: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
    MARK_READ: (conversationId: string) => `/chat/conversations/${conversationId}/read`,
    UNREAD_COUNTS: '/chat/unread-counts',
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: '/notifications/read',
    MARK_ALL_READ: '/notifications/read-all',
  },

  // Offers endpoints
  OFFERS: {
    CREATE: '/offers',
    SENT: '/offers/sent',
    RECEIVED: '/offers/received',
    BY_AD: (adId: string) => `/offers/ad/${adId}`,
    UPDATE_STATUS: (offerId: string) => `/offers/${offerId}/status`,
  },
} as const;
