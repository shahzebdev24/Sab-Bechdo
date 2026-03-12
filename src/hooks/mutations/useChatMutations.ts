/**
 * Chat Mutation Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../api';
import { queryKeys } from '../queries/queryKeys';
import type { CreateConversationRequest } from '../../types';

/**
 * Create or get conversation
 */
export const useCreateOrGetConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationRequest) => chatService.createOrGetConversation(data),
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
    },
  });
};

/**
 * Mark conversation as read
 */
export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => chatService.markConversationRead(conversationId),
    onSuccess: (_, conversationId) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ 
        queryKey: ['chat', 'messages', conversationId] 
      });
      
      // Invalidate conversation detail
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.chat.conversation(conversationId) 
      });
      
      // Invalidate unread counts
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.chat.unreadCounts 
      });
    },
  });
};
