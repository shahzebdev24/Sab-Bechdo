/**
 * useResetPassword Hook
 * TanStack Query mutation for reset password
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api';
import type { ResetPasswordRequest } from '../../types';

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    
    onSuccess: () => {
      console.log('Password reset successfully');
    },
    
    onError: (error) => {
      console.error('Reset password error:', error);
    },
  });
};
