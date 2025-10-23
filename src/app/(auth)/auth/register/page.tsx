// src/app/(auth)/register/page.tsx
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
import { Loader2, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';

const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and numbers'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof registerSchema>;

const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, text: 'Very Weak', color: 'bg-red-500' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  const strengths = [
    { score: 0, text: 'Very Weak', color: 'bg-red-500' },
    { score: 1, text: 'Weak', color: 'bg-red-400' },
    { score: 2, text: 'Fair', color: 'bg-yellow-500' },
    { score: 3, text: 'Good', color: 'bg-blue-500' },
    { score: 4, text: 'Strong', color: 'bg-green-500' },
  ];

  return strengths[Math.min(score, 4)];
};

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword && password === confirmPassword;

  const onSubmit = async (data: RegisterValues) => {
    setServerError(null);
    try {
      await registerUser(data.email, data.username, data.password);
      setIsSubmitted(true);
      toast.success('Account created! Please check your email to verify your account.');
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left Side */}
        <div className="relative hidden h-full flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-10 text-white lg:flex dark:border-r overflow-hidden">
          <div className="absolute inset-0 bg-grid-small-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          <div className="relative z-20 flex items-center text-lg font-semibold">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center font-bold text-white">
                SK
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
                Skeduluk
              </span>
            </div>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-4">
              <p className="text-lg leading-relaxed font-light">
                &#34;Join thousands of creators automating their
                 social media strategy and saving hours every week.&#34;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center
                 justify-center text-white font-semibold">
                  MK
                </div>
                <div>
                  <footer className="font-medium">Marcus Kim</footer>
                  <p className="text-sm text-gray-400">Content Creator</p>
                </div>
              </div>
            </blockquote>
          </div>
        </div>

        {/* Right Side - Success Message */}
        <div className="lg:p-8 w-full">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 blur-xl" />
              <div className="relative w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Account Created!</h1>
              <p className="text-muted-foreground text-sm max-w-xs">
                We've sent a verification link to your email. Please check your 
                inbox and spam folder to confirm your account.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative  h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left Side */}
      <div className="relative hidden h-full flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-10
       text-white lg:flex dark:border-r overflow-hidden">
        <div className="absolute inset-0 bg-grid-small-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="relative z-20 flex items-center text-lg font-semibold">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center
             justify-center font-bold text-white">
              SK
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
              Skeduluk
            </span>
          </div>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-lg leading-relaxed font-light">
              &#34;Sign up today and get 30 days free. Schedule unlimited posts and grow your audience effortlessly.&#34;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full
               flex items-center justify-center text-white font-semibold">
                AR
              </div>
              <div>
                <footer className="font-medium">Alex Rodriguez</footer>
                <p className="text-sm text-gray-400">Social Media Manager</p>
              </div>
            </div>
          </blockquote>
        </div>
      </div>

      {/* Right Side */}
      <div className="lg:p-8 w-full p-6">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground">
              Get started with Skeduluk in minutes
            </p>
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={`h-10 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Choose a username"
                {...register('username')}
                className={`h-10 ${errors.username ? 'border-red-500' : ''}`}
              />
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  {...register('password')}
                  className={`pr-10 h-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Password strength</span>
                    <span
                      className={`text-xs font-semibold ${
                        passwordStrength.color === 'bg-red-500'
                          ? 'text-red-600'
                          : passwordStrength.color === 'bg-red-400'
                            ? 'text-red-500'
                            : passwordStrength.color === 'bg-yellow-500'
                              ? 'text-yellow-600'
                              : passwordStrength.color === 'bg-blue-500'
                                ? 'text-blue-600'
                                : 'text-green-600'
                      }`}
                    >
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                  className={`pr-10 h-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {confirmPassword && (
                <div className="flex items-center gap-2">
                  {passwordsMatch ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-red-600 font-medium">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}

              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full h-10 mt-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-blue-600 font-semibold hover:text-blue-700 
              underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}