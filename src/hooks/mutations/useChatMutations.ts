/**
 * Chat Mutation Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../api';
import { queryKeys } from '../queries/queryKeys';
import type { CreateConversationRequest, Conversation } from '../../types';

/**
 * Create or get conversation
 * Returns existing conversation if buyer-seller-ad combination exists
 * Creates new conversation otherwise
 */
export const useCreateOrGetConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<Conversation, Error, CreateConversationRequest>({
    mutationFn: (data: CreateConversationRequest) => chatService.createOrGetConversation(data),
    onSuccess: (conversation) => {
      // Invalidate conversations list to show new/updated conversation
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
      
      // Set conversation in cache for immediate access
      queryClient.setQueryData(
        queryKeys.chat.conversation(conversation.id),
        conversation
      );
    },
    onError: (error) => {
      console.error('[Chat] Failed to create conversation:', error);
    },
  });
};

/**
 * Mark conversation as read
 */
export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
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
