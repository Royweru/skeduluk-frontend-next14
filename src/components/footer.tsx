// src/components/Footer.js
import React from 'react';
import { LayoutGrid, Twitter, Linkedin, Github, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-sked-dark text-gray-300 py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
               <div className="bg-sked-purple p-1.5 rounded-lg">
                   <LayoutGrid className="h-5 w-5 text-white" />
               </div>
               <span className="font-bold text-xl text-white">Skeduluk</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              The social scheduler designed for speed, clarity, and growth. Take back your time.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm hover:text-sked-purple transition">Features</a></li>
              <li><a href="#" className="text-sm hover:text-sked-purple transition">Integrations</a></li>
              <li><a href="#" className="text-sm hover:text-sked-purple transition">Pricing</a></li>
              <li><a href="#" className="text-sm hover:text-sked-purple transition">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm hover:text-sked-purple transition">Documentation</a></li>
              <li><a href="#" className="text-sm hover:text-sked-purple transition">API Reference</a></li>
              <li><a href="#" className="text-sm hover:text-sked-purple transition">Blog</a></li>
              <li><a href="#" className="text-sm hover:text-sked-purple transition">Community</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm hover:text-sked-purple transition">About Us</a></li>
              <li><a href="#" className="text-sm hover:text-sked-purple transition">Careers</a></li>
              <li><a href="#" className="text-sm hover:text-sked-purple transition">Legal</a></li>
              <li><a href="#" className="text-sm flex items-center gap-2 hover:text-sked-purple transition">
                <Mail className="w-4 h-4" /> Contact
              </a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Skeduluk Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

