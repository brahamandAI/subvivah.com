'use client';

import React from 'react';
import StaticBrahmandChat from '@/components/StaticBrahmandChat';

const BrahmacharChatPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative floating planet */}
      <div className="absolute top-4 left-8 animate-spin-slow text-blue-300 text-4xl z-10">🪐</div>
      <h1 className="text-4xl font-bold text-center text-purple-200 mb-6 flex items-center gap-2">
        ब्रह्मांड AI <span className="animate-pulse">✨</span>
      </h1>
      <StaticBrahmandChat />
    </div>
  );
};

export default BrahmacharChatPage; 