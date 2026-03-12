/**
 * Notifications Service
 * All notification-related API calls
 */

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  PaginatedNotificationsResponse,
  UnreadCountResponse,
  MarkReadRequest,
  MarkReadResponse,
  ApiSuccessResponse,
} from '../../types';

/**
 * List notifications
 */
export const listNotifications = async (params?: {
  page?: number;
  limit?: number;
  onlyUnread?: boolean;
}): Promise<PaginatedNotificationsResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedNotificationsResponse>>(
    ENDPOINTS.NOTIFICATIONS.LIST,
    { params }
  );
  return response.data;
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<UnreadCountResponse>>(
    ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
  );
  return response.data;
};

/**
 * Mark notifications as read
 */
export const markNotificationsRead = async (data: MarkReadRequest): Promise<MarkReadResponse> => {
  const response = await apiClient.post<any, ApiSuccessResponse<MarkReadResponse>>(
    ENDPOINTS.NOTIFICATIONS.MARK_READ,
    data
  );
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async (): Promise<MarkReadResponse> => {
  const response = await apiClient.post<any, ApiSuccessResponse<MarkReadResponse>>(
    ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
  );
  return response.data;
};
