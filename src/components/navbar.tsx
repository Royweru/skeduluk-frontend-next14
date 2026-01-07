// src/components/Navbar.js
import React, { useState } from 'react';
import { Menu, X, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

export const Navbar = ({ isLoggedIn }:{
    isLoggedIn:boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="bg-sked-purple p-2 rounded-lg">
               <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-sked-dark">Skeduluk</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-sked-purple transition font-medium">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-sked-purple transition font-medium">Pricing</a>
            <a href="#resources" className="text-gray-600 hover:text-sked-purple transition font-medium">Resources</a>
          </div>

          {/* Dynamic CTAs based on login status */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <Link href="/dashboard/overview">
                    <button className="bg-sked-purple hover:bg-sked-purpleHover
               text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg
                shadow-sked-purple/20 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                Go to Dashboard
              </button>
              </Link>
        
            ) : (
              <>
              <Link
                href={'/auth/login'}
              >
                <button className="text-sked-dark font-bold hover:text-sked-purple transition px-4 py-2">
                  Login
                </button>
              </Link>
                <Link
                  href ={'/auth/register'}
                >
                   <button className="bg-sked-purple hover:bg-sked-purpleHover
                    text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-sked-purple/20">
                  Get Started Free
                </button>
                </Link>
             
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-sked-dark">
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Simplified for brevity */}
      {isOpen && (
        <div className="md:hidden bg-white border-b">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {/* Add mobile links here */}
            </div>
        </div>
      )}
    </nav>
  );
};
