/**
 * User Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../api';
import { queryKeys } from './queryKeys';

/**
 * Get current user profile
 */
export const useMe = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => usersService.getMe(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Get user preferences
 */
export const usePreferences = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.users.preferences,
    queryFn: () => usersService.getPreferences(),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Get seller profile by ID
 */
export const useSellerProfile = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.users.seller(id),
    queryFn: () => usersService.getSellerProfile(id),
    enabled: enabled && !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};
