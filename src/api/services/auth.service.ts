/**
 * Auth Service
 * All authentication related API calls
 */

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  FirebaseAuthRequest,
  FirebaseAuthResponse,
  ProfileResponse,
  ApiSuccessResponse,
} from '../../types';

/**
 * Login with email and password
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<any, ApiSuccessResponse<LoginResponse>>(
    ENDPOINTS.AUTH.LOGIN,
    data
  );
  return response.data;
};

/**
 * Signup with email and password
 */
export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const response = await apiClient.post<any, ApiSuccessResponse<SignupResponse>>(
    ENDPOINTS.AUTH.SIGNUP,
    data
  );
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
};

/**
 * Get user profile
 */
export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<any, ApiSuccessResponse<User>>(
    ENDPOINTS.AUTH.PROFILE
  );
  return response.data;
};

/**
 * Change password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
};

/**
 * Forgot password - Send reset email
 */
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<void> => {
  await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
};

/**
 * Reset password with token
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<void> => {
  await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
};

/**
 * Refresh access token
 */
export const refreshToken = async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<any, ApiSuccessResponse<RefreshTokenResponse>>(
    ENDPOINTS.AUTH.REFRESH_TOKEN,
    data
  );
  return response.data;
};

/**
 * Firebase authentication (Google, Facebook, Apple)
 */
export const firebaseAuth = async (data: FirebaseAuthRequest): Promise<FirebaseAuthResponse> => {
  const response = await apiClient.post<any, ApiSuccessResponse<FirebaseAuthResponse>>(
    ENDPOINTS.AUTH.FIREBASE,
    data
  );
  return response.data;
};
