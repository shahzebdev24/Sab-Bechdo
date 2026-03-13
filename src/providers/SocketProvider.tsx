/**
 * Socket Provider
 * Manages Socket.IO connection and real-time events
 * Implements best practices for real-time notifications
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { socketClient } from '../api/socket';
import { queryKeys } from '../hooks/queries/queryKeys';
import type { Notification } from '../types';
import { useAuth } from './AuthProvider';

interface SocketContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Connect to socket
  const connect = async () => {
    if (!isLoggedIn) {
      console.log('[Socket] Not logged in, skipping connection');
      return;
    }

    try {
      await socketClient.connect();
      setIsConnected(socketClient.isConnected());
      console.log('[Socket] Connected successfully');
    } catch (error) {
      console.error('[Socket] Connection error:', error);
      setIsConnected(false);
    }
  };

  // Disconnect from socket
  const disconnect = () => {
    socketClient.disconnect();
    setIsConnected(false);
    console.log('[Socket] Disconnected');
  };

  // Setup notification listener
  useEffect(() => {
    if (!isConnected) return;

    console.log('[Socket] Setting up notification listener');

    // Listen for new notifications
    const cleanupNew = socketClient.onNotificationNew((notification: Notification) => {
      console.log('[Socket] New notification received:', notification.type);

      // Invalidate notifications queries to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all 
      });

      // Update unread count immediately
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.unreadCount 
      });

      // Invalidate specific queries based on notification type
      switch (notification.type) {
        case 'like':
        case 'comment':
          // Invalidate ad details if adId is present
          if (notification.data?.adId) {
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.ads.detail(notification.data.adId as string) 
            });
          }
          break;

        case 'follow':
          // Invalidate engagement queries
          queryClient.invalidateQueries({ 
            queryKey: ['engagement', 'followers'] 
          });
          queryClient.invalidateQueries({ 
            queryKey: ['engagement', 'following'] 
          });
          break;

        case 'chat':
          // Invalidate chat queries
          queryClient.invalidateQueries({ 
            queryKey: ['chat'] 
          });
          // Also invalidate conversations list
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.chat.conversations() 
          });
          break;

        case 'offer':
          // Invalidate offers queries
          queryClient.invalidateQueries({ 
            queryKey: ['offers'] 
          });
          break;

        default:
          break;
      }
    });

    // Listen for notification removal (like/unlike behavior)
    const cleanupRemoved = socketClient.onNotificationRemoved((data) => {
      console.log('[Socket] Notification removed:', data.type, data.action);

      // Invalidate notifications queries to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all 
      });

      // Update unread count immediately
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.unreadCount 
      });

      // Invalidate specific queries based on notification type
      if (data.type === 'like' && data.adId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.ads.detail(data.adId) 
        });
      }
    });

    return () => {
      cleanupNew();
      cleanupRemoved();
    };
  }, [isConnected, queryClient]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // App coming to foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[Socket] App came to foreground, reconnecting...');
        if (isLoggedIn && !socketClient.isConnected()) {
          // Delay reconnection slightly to ensure app is fully active
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 500);
        }
      }

      // App going to background
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        console.log('[Socket] App going to background');
        // Keep connection alive in background for notifications
        // Socket.IO will handle reconnection automatically
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isLoggedIn]);

  // Connect when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      console.log('[Socket] User logged in, connecting...');
      // Small delay to ensure token is properly stored
      const timer = setTimeout(() => {
        connect();
      }, 500);
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      console.log('[Socket] User logged out, disconnecting...');
      disconnect();
    }
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic connection check
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      const connected = socketClient.isConnected();
      if (connected !== isConnected) {
        setIsConnected(connected);
      }

      // Auto-reconnect if disconnected
      if (!connected && isLoggedIn) {
        console.log('[Socket] Connection lost, attempting to reconnect...');
        connect();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn, isConnected]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
