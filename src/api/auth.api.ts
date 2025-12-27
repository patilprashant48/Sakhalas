import apiClient from './axios';
import type { LoginRequest, LoginResponse, TwoFactorRequest, TwoFactorResponse, User } from '../types/auth.types';

// Mock users for demo mode
const MOCK_USERS: Record<string, { user: User; requiresTwoFactor: boolean }> = {
  'admin@company.com': {
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'Admin',
      permissions: ['read', 'write', 'delete', 'approve'],
    },
    requiresTwoFactor: false,
  },
  'manager@company.com': {
    user: {
      id: '2',
      name: 'Project Manager',
      email: 'manager@company.com',
      role: 'Project Manager',
      permissions: ['read', 'write', 'approve'],
    },
    requiresTwoFactor: false,
  },
  'treasurer@company.com': {
    user: {
      id: '3',
      name: 'Treasurer',
      email: 'treasurer@company.com',
      role: 'Treasurer',
      permissions: ['read', 'write', 'approve'],
    },
    requiresTwoFactor: false,
  },
  'employee@company.com': {
    user: {
      id: '4',
      name: 'Employee User',
      email: 'employee@company.com',
      role: 'Employee',
      permissions: ['read', 'write'],
    },
    requiresTwoFactor: false,
  },
  'auditor@company.com': {
    user: {
      id: '5',
      name: 'Auditor User',
      email: 'auditor@company.com',
      role: 'Auditor',
      permissions: ['read'],
    },
    requiresTwoFactor: false,
  },
};

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      return response.data;
    } catch (error) {
      // Fallback to mock authentication for demo
      console.log('Using mock authentication (demo mode)');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUser = MOCK_USERS[data.email];
      
      if (!mockUser || data.password !== 'password123') {
        throw new Error('Invalid credentials');
      }
      
      return {
        user: mockUser.user,
        accessToken: 'mock-token-' + Date.now(),
        requiresTwoFactor: mockUser.requiresTwoFactor,
      };
    }
  },

  verifyTwoFactor: async (data: TwoFactorRequest): Promise<TwoFactorResponse> => {
    try {
      const response = await apiClient.post<TwoFactorResponse>('/auth/verify-2fa', data);
      return response.data;
    } catch (error) {
      // Mock 2FA verification
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockUser = MOCK_USERS[data.email];
      if (!mockUser) {
        throw new Error('Invalid user');
      }
      
      return {
        user: mockUser.user,
        accessToken: 'mock-token-' + Date.now(),
      };
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      // Return user from localStorage in demo mode
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      throw new Error('Not authenticated');
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Silent fail for demo mode
      console.log('Logout (demo mode)');
    }
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    try {
      const response = await apiClient.post<{ accessToken: string }>('/auth/refresh');
      return response.data;
    } catch (error) {
      // Mock token refresh
      return { accessToken: 'mock-token-' + Date.now() };
    }
  },
};
