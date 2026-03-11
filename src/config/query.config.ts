/**
 * TanStack Query Configuration
 * Global configuration for React Query
 */

import { QueryClient } from '@tanstack/react-query';

export const queryConfig = {
  defaultOptions: {
    queries: {
      // Stale time: Data considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache time: Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Retry failed requests 3 times
      retry: 3,
      
      // Retry delay (exponential backoff)
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
};

// Create query client instance
export const queryClient = new QueryClient(queryConfig);
