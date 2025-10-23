// src/app/(auth)/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { forgotPassword, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const email = watch('email');

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      await forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left Side - Branding */}
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
              &#34;Account security is important to us. Reset your password quickly and securely to protect your account.&#34;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                SH
              </div>
              <div>
                <footer className="font-medium">Sarah Harrison</footer>
                <p className="text-sm text-gray-400">Security Officer</p>
              </div>
            </div>
          </blockquote>
        </div>
      </div>

      {/* Right Side */}
      <div className="lg:p-8 w-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
          {!isSubmitted ? (
            <>
              <Link
                href="/auth/auth/login"
                className="inline-flex items-center text-sm text-muted-foreground
                 hover:text-foreground transition-colors w-fit"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>

              <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Forgot password?</h1>
                <p className="text-sm text-muted-foreground">
                  No worries! Enter your email and we'll send you a password reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className={`h-10 transition-colors ${
                      errors.email ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-10 mt-6" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">Remember your password?</span>
                </div>
              </div>

              <Link
                href="/auth/login"
                className="text-center text-sm text-blue-600
                 font-semibold hover:text-blue-700 underline-offset-2 hover:underline"
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400
                 to-purple-500 rounded-full opacity-20 blur-xl" />
                <div className="relative w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Check your email</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  We've sent a password reset link to <span className="font-semibold text-foreground">{submittedEmail}</span>
                </p>
              </div>

              <div className="w-full space-y-3 pt-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    The link expires in 1 hour. If you don't see the email, check your spam folder.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="w-full space-y-3">
                <Button asChild variant="default" className="w-full">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                  }}
                >
                  Try another email
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}