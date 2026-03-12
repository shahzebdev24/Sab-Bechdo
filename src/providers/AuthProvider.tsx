/**
 * Auth Provider
 * Manages authentication state across the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { isAuthenticated } from '../utils/storage';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
  checkAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Check authentication status
  const checkAuth = async () => {
    try {
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'forgot-password';
    const hasNoSegments = !segments[0];

    if (!isLoggedIn && !inAuthGroup) {
      // User not logged in, redirect to login
      router.replace('/login');
    } else if (isLoggedIn && (inAuthGroup || hasNoSegments)) {
      // User logged in but on auth screen OR no segments (initial load), redirect to home
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, segments, isLoading]);

  const signIn = () => {
    setIsLoggedIn(true);
  };

  const signOut = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        signIn,
        signOut,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
