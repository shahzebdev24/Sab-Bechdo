/**
 * Chat Query Hooks
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { chatService } from '../../api';
import { queryKeys } from './queryKeys';

/**
 * List user's conversations
 */
export const useConversations = (params?: { page?: number; limit?: number }, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.chat.conversations(params),
    queryFn: () => chatService.listConversations(params),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Infinite scroll for conversations
 */
export const useConversationsInfinite = (params?: { limit?: number }, enabled = true) => {
  return useInfiniteQuery({
    queryKey: queryKeys.chat.conversations(params),
    queryFn: ({ pageParam = 1 }) => chatService.listConversations({ ...params, page: pageParam }),
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Get conversation details
 */
export const useConversation = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.chat.conversation(id),
    queryFn: () => chatService.getConversation(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * List messages in a conversation
 */
export const useMessages = (
  conversationId: string,
  params?: { page?: number; limit?: number },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.chat.messages(conversationId, params),
    queryFn: () => chatService.listMessages(conversationId, params),
    enabled: enabled && !!conversationId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Infinite scroll for messages (reverse order - newest first)
 */
export const useMessagesInfinite = (
  conversationId: string,
  params?: { limit?: number },
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.chat.messages(conversationId, params),
    queryFn: ({ pageParam = 1 }) => chatService.listMessages(conversationId, { ...params, page: pageParam }),
    enabled: enabled && !!conversationId,
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
 * Get unread message counts per conversation
 */
export const useUnreadCounts = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.chat.unreadCounts,
    queryFn: () => chatService.getUnreadCounts(),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};
