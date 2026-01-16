'use client';
import { CTASection } from '@/components/cta-section';
import { FeaturesSection } from '@/components/features-section';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/hero-section';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/providers/auth-provider';
import React from 'react';


function Home() {
   const { isAuthenticated:isLoggedIn} = useAuth()
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default Home;