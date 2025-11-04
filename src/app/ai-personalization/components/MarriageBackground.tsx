import React from 'react';

export default function MarriageBackground() {
  return (
    <div className="fixed top-16 left-0 w-full h-[calc(100vh-4rem)] pointer-events-none overflow-hidden z-0">
      {/* Static Background gradient only */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/90 via-purple-900/90 to-indigo-950/90" />
    </div>
  );
} 