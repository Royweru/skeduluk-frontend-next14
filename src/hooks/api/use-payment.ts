import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: (data: { plan: string; payment_method?: string }) =>
      paymentsApi.initiatePayment(data),
    onError: (error: any) => {
      console.error('Payment Init Error:', error);
      toast.error(error?.response?.data?.detail || 'Failed to initiate payment');
    },
  });
};

export const useVerifyPaystackPayment = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => paymentsApi.verifyPaystackPayment(reference),
    onSuccess: (data) => {
      // 1. Show success message
      toast.success('Subscription active! Redirecting...');

      // 2. Refresh user data to update the UI (unlock Pro features immediately)
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      
      // 3. Redirect to success page or dashboard
      router.push('/payment/success'); 
    },
    onError: (error: any) => {
      console.error('Payment Verify Error:', error);
      // Let the page handle the UI error state, but we can log it here
    },
  });
};