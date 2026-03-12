/**
 * Notification Mutation Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../../api';
import { queryKeys } from '../queries/queryKeys';
import type { MarkReadRequest } from '../../types';

/**
 * Mark notifications as read
 */
export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MarkReadRequest) => notificationsService.markNotificationsRead(data),
    onSuccess: () => {
      // Invalidate notifications list
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
};

/**
 * Mark all notifications as read
 */
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllNotificationsRead(),
    onSuccess: () => {
      // Invalidate notifications list
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      
      // Update unread count to 0
      queryClient.setQueryData(queryKeys.notifications.unreadCount, { count: 0 });
    },
  });
};
