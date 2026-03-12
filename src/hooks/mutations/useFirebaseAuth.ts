/**
 * useFirebaseAuth Hook
 * TanStack Query mutation for Firebase authentication (Google, Facebook, Apple)
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api';
import { saveTokens, saveUser } from '../../utils/storage';
import type { FirebaseAuthRequest, FirebaseAuthResponse } from '../../types';

export const useFirebaseAuth = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: (data: FirebaseAuthRequest) => authService.firebaseAuth(data),
    
    onSuccess: async (response: FirebaseAuthResponse) => {
      // Save tokens to storage
      await saveTokens(response.tokens);
      
      // Save user data to storage
      await saveUser(response.user);
      
      // Call custom onSuccess if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    
    onError: (error) => {
      console.error('Firebase auth error:', error);
    },
  });
};
