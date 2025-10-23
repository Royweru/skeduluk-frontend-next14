// src/store/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  username: string;
  is_email_verified: boolean;
  plan: string;
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      
      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const formData = new FormData();
          formData.append('username', username);
          formData.append('password', password);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/token`, {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
          }
          
          const data = await response.json();
          localStorage.setItem('access_token', data.access_token);
          
          await get().refreshUser();
          
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      register: async (email: string, username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
          }
          
          const data = await response.json();
          console.log(data.message);
          
        } catch (error) {
          console.error('Registration error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      verifyEmail: async (token: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Verification failed');
          }
          
          await get().refreshUser();
          
        } catch (error) {
          console.error('Email verification error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      forgotPassword: async (email: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to send reset email');
          }
          
        } catch (error) {
          console.error('Forgot password error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Password reset failed');
          }
          
        } catch (error) {
          console.error('Reset password error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, isAuthenticated: false });
      },
      
      refreshUser: async () => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            set({ user: null, isAuthenticated: false });
            return;
          }
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              localStorage.removeItem('access_token');
              set({ user: null, isAuthenticated: false });
            }
            return;
          }
          
          const user = await response.json();
          set({ user, isAuthenticated: true });
          
        } catch (error) {
          console.error('Refresh user error:', error);
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);