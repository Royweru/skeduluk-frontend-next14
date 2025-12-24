// src/contexts/auth-context.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { useAuthStore } from '@/store/auth-store';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  verifyEmail : (token: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  
  const {
    isAuthenticated,
    isLoading,
    user,
    login,
    register,
    logout,
    refreshUser,
    verifyEmail,
  } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Failed to refresh user:', error);
      } finally {
        setIsReady(true);
      }
    };

    initAuth();
  }, [refreshUser]);

  // Don't render children until auth state is initialized
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 blur-lg animate-pulse" />
            <div className="relative w-12 h-12 border-2 border-transparent border-t-blue-400 rounded-full animate-spin" />
          </div>
          <p className="text-white text-sm font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  const value: AuthContextType = {
    isAuthenticated,
    verifyEmail,
    isLoading,
    user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;