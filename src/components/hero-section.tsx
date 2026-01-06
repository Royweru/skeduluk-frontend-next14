// src/components/HeroSection.js
import React from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
// IMPORTANT: Import your dashboard image here.
// For this code to work immediately, put your image in src/assets/ and name it dashboard-mockup.png
// import dashboardImage from '../assets/dashboard-mockup.png'; 

export const HeroSection = () => {
  // Using a placeholder if you haven't set up the image path yet.
  // Once you have the image, remove this line and uncomment the import above.
  const dashboardImage = "https://via.placeholder.com/1200x800/f3f4f6/6366f1?text=Insert+Your+Dashboard+Image+Here";

  return (
    <div className="relative bg-sked-dark overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
       {/* Subtle background graphical elements for a "tech" feel */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-sked-purple/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sked-green/10 blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
                <span className="w-3 h-3 bg-sked-green rounded-full animate-pulse"></span>
                <span className="text-sm text-white font-medium">v2.0 Now Live: Improved Analytics</span>
            </div>

            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl lg:leading-tight">
              Command Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sked-purple to-sked-green">
                Social Universe.
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Stop drowning in tabs. Plan, schedule, and analyze content across LinkedIn, Twitter/X, Facebook, and YouTube from one stunningly simple dashboard.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-sked-purple hover:bg-sked-purpleHover text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-sked-purple/30 flex items-center justify-center gap-2 group">
                Start Your Free Trial
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                Watch Demo
              </button>
            </div>
            {/* Trust indicators */}
             <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-gray-400 text-sm font-medium">
                <span className="flex items-center gap-2"><CheckCircle2 className="text-sked-green w-5 h-5"/> No credit card needed</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="text-sked-green w-5 h-5"/> 14-day free trial</span>
            </div>
          </div>

          {/* Right Column: Dashboard Mockup Visual */}
          <div className="relative mt-12 lg:mt-0 perspective-1000">
             {/* Decorative blob behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sked-purple/40 to-sked-green/30 blur-3xl -z-10 transform scale-110"></div>

            {/* The Browser Mockup Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border-4 border-sked-darker/50 bg-sked-darker transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-all duration-700 ease-out">
                {/* Browser Header Bar */}
                <div className="h-8 bg-sked-darker flex items-center px-4 gap-2 border-b border-white/10">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                </div>
                {/* The Dashboard Image */}
              <img
                src={dashboardImage}
                alt="Skeduluk Dashboard Overview"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
