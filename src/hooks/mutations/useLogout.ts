/**
 * useLogout Hook
 * TanStack Query mutation for logout
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api';
import { removeTokens, removeUser } from '../../utils/storage';
import { queryClient } from '../../config';

// Flag to prevent multiple simultaneous logout operations
let isLoggingOut = false;

export const useLogout = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: async () => {
      if (isLoggingOut) {
        return;
      }
      isLoggingOut = true;
      return authService.logout();
    },
    
    onSuccess: async () => {
      // Remove tokens FIRST before calling callback
      await removeTokens();
      
      // Remove user data from storage
      await removeUser();
      
      // Clear all queries from cache
      queryClient.clear();
      
      // Reset flag
      isLoggingOut = false;
      
      // Call custom onSuccess AFTER everything is cleared
      if (onSuccess) {
        onSuccess();
      }
    },
    
    onError: async (error) => {
      console.error('Logout error:', error);
      
      // Even if API call fails, clear local data
      await removeTokens();
      await removeUser();
      queryClient.clear();
      
      // Reset flag
      isLoggingOut = false;
      
      // Call callback even on error
      if (onSuccess) {
        onSuccess();
      }
    },
  });
};
