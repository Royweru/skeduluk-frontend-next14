// src/hooks/api/use-auth.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function useLogin() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
      toast.success('Logged in successfully');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Login failed');
    },
  });
}

export function useRegister() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/auth/login');
    },
    onError: (error: any) => {
      if (error.response?.status === 400 && error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTestEmail() {
  return  useMutation({
    mutationFn: authApi.testEmail,
    onSuccess: (data:any) => {
      toast.success(data.message);
    },   
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to send test email';
      toast.error(errorMessage);
    }
});
}