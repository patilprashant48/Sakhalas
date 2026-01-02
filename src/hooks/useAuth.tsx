import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import type { User, AuthContextType, LoginResponse } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? (JSON.parse(saved) as User) : null;
    } catch {
      localStorage.removeItem('user'); 
      localStorage.removeItem('accessToken'); 
      return null; 
    }
  });
  const [loading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // No synchronous setState inside effects — user is initialized from localStorage above.

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await authApi.login({ email, password });

    if (response.requiresTwoFactor) {
      setPendingEmail(email);
      return response;
    }

    if (response.accessToken && response.user) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    }

    return response;
  };

  const verifyTwoFactor = async (otp: string): Promise<void> => {
    if (!pendingEmail) {
      throw new Error('No pending email for two-factor verification');
    }

    const response = await authApi.verifyTwoFactor({ email: pendingEmail, otp });

    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    setPendingEmail(null);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setPendingEmail(null);
    authApi.logout().catch(() => {
      // Ignore errors on logout 
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        verifyTwoFactor,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
