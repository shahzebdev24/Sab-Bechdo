/**
 * Notifications Query Hooks
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { notificationsService } from '../../api';
import { queryKeys } from './queryKeys';

/**
 * List notifications
 */
export const useNotifications = (
  params?: { page?: number; limit?: number; onlyUnread?: boolean },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationsService.listNotifications(params),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Infinite scroll for notifications
 */
export const useNotificationsInfinite = (
  params?: { limit?: number; onlyUnread?: boolean },
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: ({ pageParam = 1 }) => notificationsService.listNotifications({ ...params, page: pageParam }),
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 30 * 1000,
  });
};

/**
 * Get unread notifications count
 */
export const useUnreadNotificationCount = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => notificationsService.getUnreadCount(),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};
