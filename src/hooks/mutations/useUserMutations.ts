/**
 * User Mutation Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../api';
import { queryKeys } from '../queries/queryKeys';
import type { UpdateProfileRequest, UpdatePreferencesRequest } from '../../types';

/**
 * Update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => usersService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update users.me cache
      queryClient.setQueryData(queryKeys.users.me, updatedUser);
      
      // Invalidate auth profile if it exists
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
};

/**
 * Update user preferences
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferencesRequest) => usersService.updatePreferences(data),
    onSuccess: (updatedPreferences) => {
      // Update preferences cache
      queryClient.setQueryData(queryKeys.users.preferences, updatedPreferences);
    },
  });
};
