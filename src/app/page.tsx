
import { CTASection } from '@/components/cta-section';
import { FeaturesSection } from '@/components/features-section';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/hero-section';
import { Navbar } from '@/components/navbar';
import React from 'react';


function Home() {
  // In a real Home, you'd determine this state from auth cookies/context
  const isLoggedIn = false; // Change to true to test logged-in view

  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white">
      <Navbar isLoggedIn={isLoggedIn} />
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