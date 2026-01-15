// src/hooks/api/use-payments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Hook to start the payment process
export function useInitiatePayment() {
  return useMutation({
    mutationFn: paymentsApi.initiatePayment,
    onSuccess: (data) => {
      // The backend returns a payment_link. We redirect the user there.
      if (data.payment_link) {
        window.location.href = data.payment_link;
      } else {
        toast.error('Failed to generate payment link');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Payment initiation failed');
    }
  });
}

// Hook to verify Paystack payment
export function useVerifyPaystackPayment() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (reference: string) => paymentsApi.verifyPaystackPayment(reference),
    onSuccess: (data) => {
      toast.success('Subscription activated successfully!');
      // Refresh user profile to show new plan immediately
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      // Redirect to the success page
      router.push('/payment/success'); 
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || 'Payment verification failed';
      toast.error(msg);
    }
  });
}

// Hook to get current subscriptions
export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: paymentsApi.getSubscriptions,
  });
}