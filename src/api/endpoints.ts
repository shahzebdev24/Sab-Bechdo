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
  
  // Add more endpoints as needed
  // PRODUCTS: {
  //   LIST: '/products',
  //   DETAIL: (id: string) => `/products/${id}`,
  // },
} as const;
