// src/app/(auth)/verify-email/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/providers/auth-provider';

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        toast.success('Email verified! Redirecting to login...');

        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to verify email';
        if (errorMsg.toLowerCase().includes('expire')) {
          setStatus('expired');
          setMessage('Your verification link has expired. Please sign up again.');
        } else {
          setStatus('error');
          setMessage(errorMsg);
        }
        toast.error(errorMsg);
      }
    };

    verify();
  }, [token, verifyEmail, router]);

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
            <span className="bg-gradient-to-r from-blue-400 to-purple-400
             bg-clip-text text-transparent font-bold">
              Skeduluk
            </span>
          </div>
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-lg leading-relaxed font-light">
              &#34;Verify your email to get started. This helps us keep
               your account secure and enables us to send you important updates.&#34;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                EC
              </div>
              <div>
                <footer className="font-medium">Emily Chen</footer>
                <p className="text-sm text-gray-400">Community Manager</p>
              </div>
            </div>
          </blockquote>
        </div>
      </div>

      {/* Right Side */}
      <div className="lg:p-8 w-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center space-y-8 py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse" />
                <div className="relative w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Verifying your email</h2>
                <p className="text-sm text-muted-foreground">
                  Please wait while we confirm your email address...
                </p>
              </div>

              <div className="w-full">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-blue-400
                   to-purple-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500
                 rounded-full opacity-20 blur-xl" />
                <div className="relative w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Email Verified!</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Your email has been verified successfully. You're all set to use Skeduluk.
                </p>
              </div>

              <Alert className="border-green-200 bg-green-50">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-800">
                  Redirecting you to login in a few seconds...
                </AlertDescription>
              </Alert>

              <Button asChild className="w-full">
                <Link href="/auth/login">
                  Go to Login <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400
                 to-pink-500 rounded-full opacity-20 blur-xl" />
                <div className="relative w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Verification Failed</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {message}
                </p>
              </div>

              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  The verification link may be invalid or corrupted.
                </AlertDescription>
              </Alert>

              <div className="w-full space-y-2">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/register">Create New Account</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400
                 to-orange-500 rounded-full opacity-20 blur-xl" />
                <div className="relative w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-yellow-600" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Link Expired</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Your verification link has expired. This is normal for security reasons.
                </p>
              </div>

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-sm text-yellow-800">
                  Please create a new account or contact support if you need help.
                </AlertDescription>
              </Alert>

              <div className="w-full space-y-2">
                <Button asChild className="w-full">
                  <Link href="/register">Create New Account</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}