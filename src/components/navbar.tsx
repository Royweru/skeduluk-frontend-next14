// src/components/navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutGrid, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils'; 
import { useAuth } from '@/providers/auth-provider';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth(); // Using your auth provider

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Resources', href: '/#resources' },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed w-full z-50 transition-all duration-300 border-b",
          scrolled || isOpen
            ? "bg-white/95 backdrop-blur-md border-slate-200 shadow-sm py-3"
            : "bg-transparent border-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group z-50">
              <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-slate-900">
                Skeduluk
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary font-bold" : "text-slate-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-slate-800 transition-all hover:scale-105 shadow-md">
                    Dashboard <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-slate-600 font-bold hover:text-primary text-sm transition-colors">
                    Login
                  </Link>
                  <Link href="/auth/register">
                    <button className="relative overflow-hidden group bg-gradient-to-r from-primary to-secondary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                      <span className="relative z-10 flex items-center gap-2">
                        Get Started <Sparkles className="w-4 h-4" />
                      </span>
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-primary focus:outline-none z-50 transition-colors"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-semibold text-slate-800 hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="w-full h-px bg-slate-100 my-6" />

              {isAuthenticated ? (
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                    Go to Dashboard <ChevronRight className="w-5 h-5" />
                  </button>
                </Link>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <button className="w-full border-2 border-slate-200 text-slate-800 py-3 rounded-xl font-bold text-lg hover:border-primary hover:text-primary transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                    <button className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold text-lg shadow-xl shadow-primary/20">
                      Get Started Free
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};