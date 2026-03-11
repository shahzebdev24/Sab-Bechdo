/**
 * useChangePassword Hook
 * TanStack Query mutation for changing password
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api';
import type { ChangePasswordRequest } from '../../types';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    
    onSuccess: () => {
      console.log('Password changed successfully');
    },
    
    onError: (error) => {
      console.error('Change password error:', error);
    },
  });
};
