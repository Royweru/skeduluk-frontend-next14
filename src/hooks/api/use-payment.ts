// src/hooks/api/use-payment.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { paymentsApi } from '@/lib/api'; 
import { useAuth } from '@/providers/auth-provider'; 

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Destructure what we need from your existing auth provider
  const { user, isAuthenticated } = useAuth(); 

  const initiatePlanSelection = async (planId: string) => {
    // 1. Guest Logic: If not logged in, send to register with the plan attached
    if (!isAuthenticated || !user) {
      toast('Create an account to secure your plan', { icon: '🔐' });
      // This matches your route structure /auth/register
      router.push(`/auth/register?plan=${planId}`);
      return;
    }

    // 2. Logged-in User Logic: Call your backend API directly
    setIsLoading(true);
    const toastId = toast.loading('Initializing secure payment...');

    try {
      // Using the paymentsApi from your src/lib/api.ts
      const data = await paymentsApi.initiatePayment({
        plan: planId,
        payment_method: 'paystack'
      });

      if (data.success && data.payment_link) {
        toast.success('Redirecting to Paystack...', { id: toastId });
        // Redirect to the Paystack URL returned by backend
        window.location.href = data.payment_link;
      } else {
        throw new Error(data.error || 'Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Payment Error:', error);
      const message = error.response?.data?.detail || error.message || 'Payment initialization failed';
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return { initiatePlanSelection, isLoading };
};