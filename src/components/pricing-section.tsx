'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Crown, ShieldCheck, ArrowRight, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInitiatePayment } from '@/hooks/api/use-payment';
const plans = [
  {
    id: 'basic',
    name: 'Starter',
    price: 9.99,
    currency: '$',
    description: 'Perfect for side-hustlers and new creators.',
    features: ['5 Social Accounts', '100 Scheduled Posts', 'Basic Analytics', 'Email Support'],
    notIncluded: ['AI Writer', 'Team Members'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 19.99,
    currency: '$',
    description: 'For growing brands dominating social media.',
    features: ['15 Social Accounts', 'Unlimited Posts', 'Advanced Analytics', 'AI Caption Writer', 'Priority Support'],
    notIncluded: [],
    popular: true, 
  },
  {
    id: 'enterprise',
    name: 'Agency',
    price: 49.99,
    currency: '$',
    description: 'Maximum power for teams and agencies.',
    features: ['Unlimited Accounts', 'Unlimited History', 'Team Collaboration', 'White-label Reports', 'Dedicated Manager'],
    notIncluded: [],
    popular: false,
  },
];

export const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { mutate, isPending:isLoading } = useInitiatePayment();

  // Helper to calculate price
  const getPrice = (price: number) => {
    if (billingCycle === 'yearly') {
      // Apply 20% discount and format
      return (price * 0.8).toFixed(2);
    }
    return price;
  };

  return (
    <section id="pricing" className="relative py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 border border-primary/20"
          >
            <Crown className="w-4 h-4 fill-current" />
            <span>Global Pricing</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Transparent pricing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">exponential growth</span>
          </h2>
          
          <div className="flex justify-center items-center gap-4 mt-8">
            <span className={cn("text-sm font-bold transition-colors", billingCycle === 'monthly' ? "text-slate-900" : "text-slate-400")}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-16 h-8 bg-slate-200 rounded-full p-1 transition-colors duration-300 focus:outline-none hover:bg-slate-300"
            >
              <motion.div 
                className="w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: billingCycle === 'monthly' ? 0 : 32 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={cn("text-sm font-bold transition-colors", billingCycle === 'yearly' ? "text-slate-900" : "text-slate-400")}>
              Yearly <span className="ml-1 text-[10px] uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full tracking-wide">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative rounded-3xl p-8 border transition-all duration-300 flex flex-col h-full",
                plan.popular 
                  ? "bg-slate-900 border-slate-900 text-white shadow-2xl scale-105 z-10 ring-4 ring-primary/20" 
                  : "bg-white border-slate-100 text-slate-900 hover:border-primary/50 hover:shadow-xl"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" /> Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className={cn("text-xl font-bold mb-2", plan.popular ? "text-white" : "text-slate-900")}>
                  {plan.name}
                </h3>
                <p className={cn("text-sm mb-6", plan.popular ? "text-slate-400" : "text-slate-500")}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {plan.currency}{getPrice(plan.price)}
                  </span>
                  <span className={cn("text-sm font-medium", plan.popular ? "text-slate-400" : "text-slate-500")}>/mo</span>
                </div>
                {billingCycle === 'yearly' && (
                   <p className={cn("text-xs mt-1", plan.popular ? "text-slate-400" : "text-slate-500")}>
                     Billed ${((plan.price * 0.8) * 12).toFixed(2)} yearly
                   </p>
                )}
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={cn("mt-0.5 p-0.5 rounded-full", plan.popular ? "bg-primary/20 text-primary" : "bg-green-100 text-green-600")}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className={cn("text-sm font-medium", plan.popular ? "text-slate-200" : "text-slate-700")}>{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 opacity-50">
                    <div className={cn("mt-0.5 p-0.5 rounded-full", plan.popular ? "bg-slate-800 text-slate-600" : "bg-slate-100 text-slate-400")}>
                      <X className="w-3.5 h-3.5" />
                    </div>
                    <span className={cn("text-sm font-medium", plan.popular ? "text-slate-500" : "text-slate-400")}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isLoading}
                onClick={() => mutate({plan:plan.id})}
                className={cn(
                  "w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 group",
                  plan.popular 
                    ? "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-lg shadow-primary/20" 
                    : "bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200",
                  isLoading && "opacity-70 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    Choose {plan.name} 
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Footer Trust */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-center items-center gap-6 text-slate-400 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-slate-400" />
            <span>International Payments</span>
          </div>
          <div className="hidden md:block w-1.5 h-1.5 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span>Secure Checkout</span>
          </div>
          <div className="hidden md:block w-1.5 h-1.5 bg-slate-300 rounded-full" />
          <span>Cancel anytime</span>
        </div>
      </div>
    </section>
  );
};