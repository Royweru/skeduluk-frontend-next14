// src/app/(auth)/auth/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import { authApi, paymentsApi } from '@/lib/api'; // Using your API lib
import toast from 'react-hot-toast';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3).max(20),
    password: z.string().min(8),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterWithPlan() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan'); 

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Register User
      await authApi.register({
        email: data.email,
        username: data.username,
        password: data.password,
      });

      // 2. Login immediately to get Token
      const loginRes = await authApi.login({
        username: data.username,
        password: data.password
      });

      // 3. Set Token
      localStorage.setItem('access_token', loginRes.access_token);
      toast.success('Account created successfully!');

      // 4. CHECK FOR PLAN & INITIATE PAYMENT
      if (plan) {
        toast.loading(`Setting up your ${plan} subscription...`);
        
        try {
            const paymentRes = await paymentsApi.initiatePayment({
                plan: plan,
                payment_method: 'paystack'
            });
            
            if (paymentRes.success && paymentRes.payment_link) {
                // Redirect external to Paystack
                window.location.href = paymentRes.payment_link;
                return; 
            }
        } catch (paymentError) {
            console.error("Payment init failed immediately after register", paymentError);
            toast.error("Account created, but payment initialization failed. Please try from dashboard.");
            router.push('/dashboard/billing'); // Fallback
            return;
        }
      }

      // 5. Default Redirect
      router.push('/dashboard');

    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-sm mx-auto">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        {plan && (
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold inline-block mx-auto mb-2 border border-primary/20">
                🚀 Selected Plan: {plan.toUpperCase()}
            </div>
        )}
        <p className="text-sm text-muted-foreground">
          Enter your email below to create your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...register('email')} placeholder="name@example.com" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register('username')} placeholder="johndoe" />
            {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} id="password" {...register('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input type="password" id="confirmPassword" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold transition-all" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (plan ? `Continue to Payment` : `Create Account`)}
        </Button>
      </form>
      
      <div className="text-center text-sm">
        Already have an account? <Link href="/auth/login" className="text-primary hover:underline font-bold">Sign in</Link>
      </div>
    </div>
  );
}