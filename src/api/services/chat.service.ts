/**
 * Chat Service
 * All chat-related API calls
 */

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  Conversation,
  CreateConversationRequest,
  PaginatedConversationsResponse,
  PaginatedMessagesResponse,
  UnreadCountsResponse,
  ApiSuccessResponse,
} from '../../types';

/**
 * Create or get conversation with another user
 */
export const createOrGetConversation = async (data: CreateConversationRequest): Promise<Conversation> => {
  const response = await apiClient.post<any, ApiSuccessResponse<Conversation>>(
    ENDPOINTS.CHAT.CONVERSATIONS,
    data
  );
  return response.data;
};

/**
 * List user's conversations
 */
export const listConversations = async (params?: { page?: number; limit?: number }): Promise<PaginatedConversationsResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedConversationsResponse>>(
    ENDPOINTS.CHAT.CONVERSATIONS,
    { params }
  );
  return response.data;
};

/**
 * Get conversation details
 */
export const getConversation = async (id: string): Promise<Conversation> => {
  const response = await apiClient.get<any, ApiSuccessResponse<Conversation>>(
    ENDPOINTS.CHAT.CONVERSATION_DETAIL(id)
  );
  return response.data;
};

/**
 * List messages in a conversation
 */
export const listMessages = async (
  conversationId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedMessagesResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<PaginatedMessagesResponse>>(
    ENDPOINTS.CHAT.MESSAGES(conversationId),
    { params }
  );
  return response.data;
};

/**
 * Mark conversation messages as read
 */
export const markConversationRead = async (conversationId: string): Promise<void> => {
  await apiClient.post(ENDPOINTS.CHAT.MARK_READ(conversationId));
};

/**
 * Get unread message counts per conversation
 */
export const getUnreadCounts = async (): Promise<UnreadCountsResponse> => {
  const response = await apiClient.get<any, ApiSuccessResponse<UnreadCountsResponse>>(
    ENDPOINTS.CHAT.UNREAD_COUNTS
  );
  return response.data;
};
