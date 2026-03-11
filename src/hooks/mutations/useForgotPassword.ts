/**
 * useForgotPassword Hook
 * TanStack Query mutation for forgot password
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api';
import type { ForgotPasswordRequest } from '../../types';

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authService.forgotPassword(data),
    
    onSuccess: () => {
      console.log('Password reset email sent');
    },
    
    onError: (error) => {
      console.error('Forgot password error:', error);
    },
  });
};
