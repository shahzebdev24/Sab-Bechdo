/**
 * Notification Types
 */

export type NotificationType = 
  | 'chat'
  | 'like'
  | 'comment'
  | 'follow'
  | 'system'
  | 'offer'
  | 'ad_status';

export interface Notification {
  id: string;
  user: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkReadRequest {
  ids: string[];
}

export interface MarkReadResponse {
  count: number;
}
