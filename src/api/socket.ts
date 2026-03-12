/**
 * Socket.IO Client
 * Real-time communication for chat and notifications
 */

import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config';
import { getAccessToken } from '../utils/storage';
import type { Message, Notification, MessageNewEvent, MessagesReadEvent } from '../types';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to Socket.IO server
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      const token = await getAccessToken();
      
      if (!token) {
        console.warn('No access token available for socket connection');
        return;
      }

      // Extract base URL without /api/v1
      const baseUrl = API_CONFIG.BASE_URL.replace('/api/v1', '');

      this.socket = io(baseUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventListeners();
      
      console.log('Socket connection initiated');
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Setup default event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });
  }

  // ============ CONVERSATION MANAGEMENT ============

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('join_conversation', { conversationId });
    console.log('Joined conversation:', conversationId);
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('leave_conversation', { conversationId });
    console.log('Left conversation:', conversationId);
  }

  // ============ MESSAGE OPERATIONS ============

  /**
   * Send a message
   */
  sendMessage(conversationId: string, body: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('message:send', { conversationId, body });
  }

  /**
   * Mark messages as read
   */
  markMessagesRead(conversationId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('message:read', { conversationId });
  }

  // ============ EVENT LISTENERS ============

  /**
   * Listen for new messages
   */
  onMessageNew(callback: (data: MessageNewEvent) => void): () => void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return () => {};
    }

    this.socket.on('message:new', callback);

    // Return cleanup function
    return () => {
      this.socket?.off('message:new', callback);
    };
  }

  /**
   * Listen for messages read event
   */
  onMessagesRead(callback: (data: MessagesReadEvent) => void): () => void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return () => {};
    }

    this.socket.on('messages:read', callback);

    // Return cleanup function
    return () => {
      this.socket?.off('messages:read', callback);
    };
  }

  /**
   * Listen for new notifications
   */
  onNotificationNew(callback: (notification: Notification) => void): () => void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return () => {};
    }

    this.socket.on('notification:new', callback);

    // Return cleanup function
    return () => {
      this.socket?.off('notification:new', callback);
    };
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.setupEventListeners(); // Re-setup default listeners
    }
  }
}

// Export singleton instance
export const socketClient = new SocketClient();

// Export class for testing
export { SocketClient };
