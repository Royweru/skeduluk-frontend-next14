import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { paymentsApi } from '@/lib/api'; 
import { useAuth } from '@/providers/auth-provider'; 

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // New state for verification
  const router = useRouter();
  
  const { user, isAuthenticated } = useAuth(); 

  // 1. INITIATE (Send user to Paystack)
  const initiatePlanSelection = async (planId: string) => {
    if (!isAuthenticated || !user) {
      toast('Create an account to secure your plan', { icon: '🔐' });
      router.push(`/auth/register?plan=${planId}`);
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Initializing secure payment...');

    try {
      const data = await paymentsApi.initiatePayment({
        plan: planId,
        payment_method: 'paystack'
      });

      if (data.success && data.payment_link) {
        toast.success('Redirecting to Paystack...', { id: toastId });
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

  // 2. VERIFY (Handle return from Paystack)
  const verifyPayment = async (reference: string) => {
    setIsVerifying(true);
    try {
      const data = await paymentsApi.verifyPaystackPayment(reference);
      
      if (data.success) {
        return { success: true, plan: data.plan, subscription_id: data.subscription_id };
      } else {
        throw new Error(data.error || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Verification Error:', error);
      const message = error.response?.data?.detail || error.message || 'Could not verify payment';
      return { success: false, error: message };
    } finally {
      setIsVerifying(false);
    }
  };

  return { 
    initiatePlanSelection, 
    verifyPayment, 
    isLoading,
    isVerifying 
  };
};