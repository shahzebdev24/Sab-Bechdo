/**
 * useLogout Hook
 * TanStack Query mutation for logout
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api';
import { removeTokens, removeUser } from '../../utils/storage';
import { queryClient } from '../../config';

export const useLogout = () => {
  return useMutation({
    mutationFn: () => authService.logout(),
    
    onSuccess: async () => {
      // Remove tokens from storage
      await removeTokens();
      
      // Remove user data from storage
      await removeUser();
      
      // Clear all queries from cache
      queryClient.clear();
    },
    
    onError: (error) => {
      console.error('Logout error:', error);
      
      // Even if API call fails, clear local data
      removeTokens();
      removeUser();
      queryClient.clear();
    },
  });
};
