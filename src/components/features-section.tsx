// src/components/FeaturesSection.js
import React from 'react';
import { CalendarDays, BarChart3, Share2, Zap } from 'lucide-react';

const features = [
  {
    icon: <CalendarDays className="w-8 h-8 text-white" />,
    title: 'Unified Scheduling',
    description: 'Plan months of content in minutes. Drag-and-drop calendar view for all your connected platforms.',
    color: 'bg-sked-purple'
  },
  {
    icon: <Share2 className="w-8 h-8 text-white" />,
    title: 'Multi-Platform Connect',
    description: 'Seamlessly connect Facebook, LinkedIn, X, YouTube and more. Manage everything in one place.',
    color: 'bg-sked-green'
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-white" />,
    title: 'Actionable Analytics',
    description: 'Track views, likes, comments, and shares across platforms. Understand what performs best.',
    color: 'bg-orange-500' // Using the orange accent from the "Success Rate" chart
  },
  {
    icon: <Zap className="w-8 h-8 text-white" />,
    title: 'Instant Engagement',
    description: 'Monitor connected account status and jump straight into engagement from your dashboard.',
    color: 'bg-blue-500'
  },
];

export const FeaturesSection = () => {
  return (
    <div id="features" className="py-24 bg-sked-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base text-sked-purple font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-sked-dark sm:text-4xl">
            Everything you need to dominate social.
          </p>
          <p className="mt-4 text-xl text-gray-500">
            Skeduluk is designed around clarity and speed. We removed the clutter so you can focus on creating connections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative overflow-hidden group">
               {/* Hover gradient effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${feature.color}`}></div>

              <div className={`inline-flex p-4 rounded-xl mb-6 ${feature.color} shadow-lg shadow-${feature.color}/30`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-sked-dark mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

