// app/payment/verify/page.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVerifyPaystackPayment } from '@/hooks/api/use-payment';
import { Loader2, XCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming you have shadcn/ui
import { cn } from '@/lib/utils';

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verifyMutation = useVerifyPaystackPayment();
  
  // Use a ref to prevent double-firing in React Strict Mode
  const hasFired = useRef(false);

  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const provider = searchParams.get('provider');

  useEffect(() => {
    if (!reference) return;
    if (hasFired.current) return;

    // Only handle Paystack here
    if (provider === 'paystack' || !provider) { // Default to paystack if missing
      hasFired.current = true;
      verifyMutation.mutate(reference);
    }
  }, [reference, provider, verifyMutation]);

  // Case 1: No reference found in URL
  if (!reference) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Request</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find a payment reference to verify. Please try again.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Case 2: Loading State
  if (verifyMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h1>
          <p className="text-gray-600">
            Please wait while we confirm your subscription...
          </p>
          <p className="text-sm text-gray-400 mt-4">Do not close this window</p>
        </div>
      </div>
    );
  }

  // Case 3: Error State
  if (verifyMutation.isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">
            {(verifyMutation.error as any)?.response?.data?.detail || "We couldn't verify your payment."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push('/contact')}>
              Contact Support
            </Button>
            <Button onClick={() => router.push('/pricing')}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Case 4: Success is handled by the redirect in the hook, 
  // but we render null here to avoid flash content
  return null;
}