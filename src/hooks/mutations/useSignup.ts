/**
 * useSignup Hook
 * TanStack Query mutation for signup
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api';
import { saveTokens, saveUser } from '../../utils/storage';
import type { SignupRequest, SignupResponse } from '../../types';

export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    
    onSuccess: async (response: SignupResponse) => {
      // Save tokens to storage
      await saveTokens(response.tokens);
      
      // Save user data to storage
      await saveUser(response.user);
    },
    
    onError: (error) => {
      console.error('Signup error:', error);
    },
  });
};
