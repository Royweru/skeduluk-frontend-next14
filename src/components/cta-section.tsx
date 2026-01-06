// src/components/CTASection.js
import React from 'react';

export const CTASection = () => {
  return (
    <div className="bg-sked-purple py-20 relative overflow-hidden">
        {/* Background Pattern */}
       <svg className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 text-white/10 w-[500px] h-[500px]" fill="currentColor" viewBox="0 0 200 200">
        <path d="M45.3,-53C58.7,-43.4,69.6,-28.6,74.3,-11.7C79,5.2,77.5,24.2,68.8,39.3C60.1,54.4,44.2,65.7,26.4,71.7C8.7,77.7,-10.9,78.4,-28.6,71.9C-46.3,65.4,-62.1,51.7,-71.2,34.6C-80.3,17.6,-82.7,-2.8,-76.9,-20.3C-71.1,-37.8,-57.1,-52.4,-41.6,-61.1C-26.1,-69.8,-9.1,-72.6,5,-78.5C19.1,-84.5,31.9,-62.6,45.3,-53Z" transform="translate(100 100)" />
      </svg>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl font-extrabold text-white sm:text-5xl mb-8">
          Ready to upgrade your social presence?
        </h2>
        <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
          Join thousands of marketers and creators who save 10+ hours every week with Skeduluk.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-sked-purple hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl">
            Get Started for Free
            </button>
            <button className="bg-transparent text-white border-2 border-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg transition-all">
            View Pricing Plans
            </button>
        </div>
      </div>
    </div>
  );
};
