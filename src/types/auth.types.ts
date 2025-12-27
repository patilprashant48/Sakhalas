export type UserRole = 'Admin' | 'Project Manager' | 'Employee' | 'Treasurer' | 'Auditor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  requiresTwoFactor: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  requiresTwoFactor: boolean;
  user?: User;
}

export interface TwoFactorRequest {
  email: string;
  otp: string;
}

export interface TwoFactorResponse {
  accessToken: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  verifyTwoFactor: (otp: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
