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

/**
 * Ad reference in conversation
 * Contains essential ad info for chat context
 */
export interface ConversationAd {
  id: string;
  title: string;
  photoUrls: string[];
  price: number;
  currency: string;
  status: 'active' | 'pending' | 'sold' | 'archived';
  condition: 'new' | 'used';
}

export interface Conversation {
  id: string;
  participants: User[];
  buyer: User;
  seller: User;
  ad: ConversationAd; // Required - every conversation is about a specific ad
  lastMessage?: string | Message;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  sellerId: string;
  adId: string; // Required - must specify which ad to chat about
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
  count: number;
}
