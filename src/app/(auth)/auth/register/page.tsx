"use client";

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
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'; // ✅ IMPORT

// ... (Keep your registerSchema and getPasswordStrength logic here exactly as before) ...
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterValues) => {
    setServerError(null);
    try {
      await registerUser(data.email, data.username, data.password);
      setIsSubmitted(true);
      toast.success('Account created! Please check your email.');
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Success view (only for Email registration)
  if (isSubmitted) {
    return (
      <div className="container relative h-screen flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
             <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Check your inbox!</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
             We have sent a verification link to your email. Please verify to continue.
          </p>
          <Button asChild variant="outline">
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left Side - Visuals (Kept same) */}
      <div className="relative hidden h-full flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-10 text-white lg:flex dark:border-r overflow-hidden">
        <div className="absolute inset-0 bg-grid-small-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="relative z-20 flex items-center text-lg font-semibold">
           <span className="font-bold">Skeduluk</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote><p className="text-lg font-light">&#34;Join thousands of creators...&#34;</p></blockquote>
        </div>
      </div>

      {/* Right Side */}
      <div className="lg:p-8 w-full p-6">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground">Get started with Skeduluk in minutes</p>
          </div>

          {/* ✅ GOOGLE SIGN UP SECTION */}
          <div className="space-y-4">
             {/* Uses 'signup_with' text context */}
            <GoogleSignInButton text="signup_with" />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or register with email</span>
              </div>
            </div>
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ... (Existing Email/Username/Password Inputs) ... */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register('username')} className={errors.username ? 'border-red-500' : ''} />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
               <Label htmlFor="password">Password</Label>
               <div className="relative">
                 <Input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-500">
                   {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                 </button>
               </div>
               {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            
            <div className="space-y-2">
               <Label htmlFor="confirmPassword">Confirm Password</Label>
               <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
               {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}