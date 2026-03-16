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
    // If already connected, just return
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // If socket exists but disconnected, disconnect first
    if (this.socket && !this.socket.connected) {
      console.log('Cleaning up old socket connection');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    try {
      const token = await getAccessToken();
      
      if (!token) {
        console.warn('No access token available for socket connection');
        return;
      }

      // Extract base URL without /api/v1
      const baseUrl = API_CONFIG.BASE_URL.replace('/api/v1', '');

      console.log('Creating new socket connection with fresh token');

      this.socket = io(baseUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        autoConnect: true,
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
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      console.log('Socket disconnected and cleaned up');
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
      
      // If server disconnected us, try to reconnect with fresh token
      if (reason === 'io server disconnect' || reason === 'transport close') {
        console.log('Server disconnected, will reconnect with fresh token');
      }
    });

    this.socket.on('connect_error', async (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      // If authentication failed, disconnect and let AuthProvider handle it
      if (error.message === 'Authentication failed' || error.message.includes('jwt') || error.message.includes('token')) {
        console.log('Socket authentication failed - token may be expired');
        
        // Don't keep trying with bad token
        this.disconnect();
        return;
      }
      
      // For other errors, try to reconnect with fresh token
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        // Wait before reconnecting
        setTimeout(async () => {
          await this.connect();
        }, 2000 * this.reconnectAttempts); // Exponential backoff
      } else {
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
   * Listen for notification removal (like/unlike behavior)
   */
  onNotificationRemoved(callback: (data: { type: string; adId?: string; userId?: string; action?: string }) => void): () => void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return () => {};
    }

    this.socket.on('notification:removed', callback);

    // Return cleanup function
    return () => {
      this.socket?.off('notification:removed', callback);
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
