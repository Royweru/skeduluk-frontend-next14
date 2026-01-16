import React from 'react';
import { Navbar } from '@/components/navbar';
import { PricingSection } from '@/components/pricing-section';
import { Footer } from '@/components/footer';
export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* You can fetch session here to pass isLoggedIn={true} 
         For now defaulting to false/guest logic 
      */}
      <Navbar  /> 
      
      <div className="pt-20"> 
        <PricingSection />
      </div>
      
      <Footer />
    </main>
  );
}