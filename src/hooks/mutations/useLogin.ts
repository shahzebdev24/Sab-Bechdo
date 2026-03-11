/**
 * useLogin Hook
 * TanStack Query mutation for login
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api';
import { saveTokens, saveUser } from '../../utils/storage';
import type { LoginRequest, LoginResponse } from '../../types';

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    
    onSuccess: async (response: LoginResponse) => {
      // Save tokens to storage
      await saveTokens(response.tokens);
      
      // Save user data to storage
      await saveUser(response.user);
    },
    
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};
