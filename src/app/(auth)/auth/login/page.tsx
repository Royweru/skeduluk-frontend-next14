// src/app/(auth)/auth/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    setServerError(null);
    try {
      await login(data.username, data.password);
      toast.success('Welcome back!');
      router.push('/dashboard/overview/');
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left Side - Branding & Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-10 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-small-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        {/* Content Container */}
        <div className="relative z-20 flex flex-col justify-between w-full">
          {/* Logo & Brand */}
          <div className="flex items-center text-lg font-semibold">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
                SK
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
                Skeduluk
              </span>
            </div>
          </div>
          
          {/* Testimonial */}
          <div className="mt-auto">
            <blockquote className="space-y-4">
              <p className="text-lg leading-relaxed font-light">
                &#34;Skeduluk has transformed how I manage my social media. It&#39;s intuitive, powerful, and saves me hours every week.&#34;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  JD
                </div>
                <div>
                  <footer className="font-medium">Jessica Davis</footer>
                  <p className="text-sm text-gray-400">Marketing Manager</p>
                </div>
              </div>
            </blockquote>
          </div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white min-h-screen lg:min-h-0">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo - Shows only on small screens */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
                SK
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold text-xl">
                Skeduluk
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Error Alert */}
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Enter your username"
                {...register('username')}
                className={`h-11 transition-colors ${
                  errors.username ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className={`h-11 pr-10 transition-colors ${
                    errors.password ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full h-11 mt-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-muted-foreground">
            Don&#39;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-blue-600 font-semibold hover:text-blue-700 underline-offset-2 hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}