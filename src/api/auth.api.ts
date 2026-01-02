import apiClient from './axios';
import type { LoginRequest, LoginResponse, TwoFactorRequest, TwoFactorResponse, User } from '../types/auth.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);

    // Backend returns: { success: boolean, data: { user, token, requiresTwoFactor? } }
    const payload = response.data?.data || {};

    // Store token in localStorage if present
    if (payload.token) {
      localStorage.setItem('accessToken', payload.token);
    }

    // Normalize to frontend LoginResponse shape
    const normalized: LoginResponse = {
      accessToken: payload.token,
      requiresTwoFactor: !!payload.requiresTwoFactor,
      user: payload.user,
    };

    return normalized;
  },

  verifyTwoFactor: async (data: TwoFactorRequest): Promise<TwoFactorResponse> => {
    const response = await apiClient.post<TwoFactorResponse>('/auth/verify-2fa', data);
    
    const token = response.data.token || response.data.accessToken;
    if (token) {
      localStorage.setItem('accessToken', token);
    }
    
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh');
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },
};
