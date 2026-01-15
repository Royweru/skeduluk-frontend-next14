// app/payment/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti'; 

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Trigger confetti on load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, 
        particleCount,
        origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, 
        particleCount,
        origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-green-100">
        
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-lg text-gray-600 mb-8">
          You are now upgraded to the <span className="font-semibold text-green-600">Pro Plan</span>. 
          Your account has been instantly updated with new limits.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            What you can do now:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">✓ Schedule unlimited posts</li>
            <li className="flex items-center gap-2">✓ Access advanced AI analytics</li>
            <li className="flex items-center gap-2">✓ Priority support</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={() => router.push('/settings/billing')}
          >
            View Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}