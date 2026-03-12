/**
 * Chat Types
 */

import { User } from './auth.types';

export interface Message {
  id: string;
  conversation: string;
  sender: User | string;
  body: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  participantId: string;
}

export interface PaginatedConversationsResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedMessagesResponse {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCount {
  conversationId: string;
  count: number;
}

export interface UnreadCountsResponse {
  counts: UnreadCount[];
}

// Socket events
export interface SendMessageData {
  conversationId: string;
  body: string;
}

export interface MessageNewEvent {
  message: Message;
  conversationId: string;
}

export interface MessagesReadEvent {
  conversationId: string;
  userId: string;
}
