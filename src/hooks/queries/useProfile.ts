/**
 * useProfile Hook
 * TanStack Query for fetching user profile
 */

import { useQuery } from '@tanstack/react-query';
import { authService } from '../../api';
import { isAuthenticated } from '../../utils/storage';

export const PROFILE_QUERY_KEY = ['profile'];

export const useProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => authService.getProfile(),
    
    // Only fetch if user is authenticated
    enabled: false, // Will be enabled manually when needed
    
    // Stale time: 5 minutes
    staleTime: 5 * 60 * 1000,
    
    // Cache time: 10 minutes
    gcTime: 10 * 60 * 1000,
    
    // Retry on failure
    retry: 2,
  });
};

/**
 * Hook to prefetch profile data
 */
export const usePrefetchProfile = () => {
  const { refetch } = useProfile();
  
  const prefetch = async () => {
    const authenticated = await isAuthenticated();
    if (authenticated) {
      refetch();
    }
  };
  
  return { prefetch };
};
