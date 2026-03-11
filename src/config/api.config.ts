/**
 * API Configuration
 * Central configuration for all API related settings
 */

// Get environment variables
const getApiBaseUrl = () => {
  // Use environment variable if available
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // Fallback to default based on environment
  return __DEV__ 
    ? 'http://localhost:3000/api/v1'  // Development
    : 'https://api.sabbechdo.com/api/v1'; // Production
};

export const API_CONFIG = {
  // Base URL - Uses environment variable or defaults
  BASE_URL: getApiBaseUrl(),
  
  // Request timeout (30 seconds)
  TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000,
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Retry configuration
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
  },
} as const;

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@sab_bechdo_access_token',
  REFRESH_TOKEN: '@sab_bechdo_refresh_token',
  USER: '@sab_bechdo_user',
} as const;
