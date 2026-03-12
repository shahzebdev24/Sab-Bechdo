/**
 * Authentication Types
 * All types related to authentication
 */

import { UserLocation } from './user.types';

// User object
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'admin';
  avatarUrl?: string;
  username?: string;
  phone?: string;
  location?: UserLocation;
  linkedProviders: LinkedProvider[];
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedProvider {
  provider: 'local' | 'google' | 'facebook' | 'apple';
  providerId: string | null;
  linkedAt: string;
}

// Auth tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Signup
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  user: User;
  tokens: AuthTokens;
}

// Change Password
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Forgot Password
export interface ForgotPasswordRequest {
  email: string;
}

// Reset Password
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// Refresh Token
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Firebase Auth
export interface FirebaseAuthRequest {
  token: string;
}

export interface FirebaseAuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Profile Response
export interface ProfileResponse {
  user: User;
}
