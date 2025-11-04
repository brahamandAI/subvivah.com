'use client';

import React, { useState } from 'react';
import { Moon, Sun, Stars } from 'lucide-react';
import KundliForm from './KundliForm';
import KundliIntro from './KundliIntro';
import KundliResult from './KundliResult';
import { useZodiac } from '../context/ZodiacContext';

const containers = [
  { component: <KundliIntro />, label: 'Intro' },
  { component: <KundliForm />, label: 'Form' },
  { component: <KundliResult />, label: 'Result' },
];

const KundliGenerator: React.FC = () => {
  const { result } = useZodiac();
  // If result is available, always focus on the result container
  const [active, setActive] = useState(0);

  // If result is available, focus on result
  React.useEffect(() => {
    if (result) setActive(2);
  }, [result]);

  const prev = () => setActive((prev) => (prev === 0 ? 2 : prev - 1));
  const next = () => setActive((prev) => (prev === 2 ? 0 : prev + 1));

  // Calculate positions for coverflow effect
  const getPosition = (idx: number) => {
    if (idx === active) return 'center';
    if ((active === 0 && idx === 2) || idx === active - 1) return 'left';
    return 'right';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 relative pb-32">
      {/* Ensure complete background coverage with extra height */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 -z-10 h-full min-h-screen"></div>
      <div className="absolute top-0 left-0 w-full min-h-full bg-indigo-950 -z-20"></div>
      <div className="absolute bottom-0 left-0 w-full h-60 bg-indigo-950 -z-15"></div>
      <div className="fixed inset-0 bg-indigo-950/50 -z-30 pointer-events-none"></div>
      <div className="container mx-auto px-2 sm:px-4 py-2 md:py-4 relative z-10">
      <header className="text-center mb-10 sm:mb-16 md:mb-20 relative">
        <div className="absolute top-0 left-0 opacity-30">
          <Stars size={24} />
        </div>
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-2">
          <Sun className="text-amber-300" size={28} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-purple-200">
            Celestial Birth Chart
          </h1>
          <Moon className="text-blue-200" size={24} />
        </div>
        <p className="text-base sm:text-lg text-purple-200 max-w-xs sm:max-w-xl md:max-w-2xl mx-auto">
          Discover your cosmic blueprint and the celestial influences that shape your life journey
        </p>
      </header>

      {/* Added gap between heading and slider */}
      <div className="mb-32 sm:mb-40 md:mb-52 lg:mb-64 xl:mb-72"></div>

      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-4xl h-auto flex flex-col sm:relative sm:flex-none sm:h-[400px] md:h-[500px] items-center justify-center">
          {containers.map((c, idx) => {
            const pos = getPosition(idx);
            // On mobile, only show the active slide, stacked vertically
            let className = 'transition-all duration-500 ease-in-out flex items-center justify-center w-full';
            if (typeof window !== 'undefined' && window.innerWidth < 640) {
              // Mobile: only show the active slide
              className += idx === active ? ' relative z-20 scale-100' : ' hidden';
            } else {
              // Desktop: coverflow effect
              className = 'absolute transition-all duration-500 ease-in-out flex items-center justify-center';
              if (pos === 'center') {
                className += ' left-1/2 -translate-x-1/2 z-20 scale-100 w-[95vw] sm:w-[500px] md:w-[650px] h-[80px] sm:h-[100px]';
              } else if (pos === 'left') {
                className += ' left-0 z-10 scale-75 opacity-10 w-[60vw] sm:w-[300px] md:w-[500px] h-[40px] sm:h-[50px]';
              } else {
                className += ' right-0 z-10 scale-75 opacity-10 w-[60vw] sm:w-[300px] md:w-[500px] h-[10px] sm:h-[10px]';
              }
            }
            return (
              <div key={c.label} className={className} style={{ pointerEvents: pos === 'center' ? 'auto' : 'none' }}>
                {c.component}
              </div>
            );
          })}
        </div>
        <div className="flex flex-row justify-between items-center w-full max-w-6xl mt-8 px-4 sm:px-8 md:px-12">
          <button
            onClick={prev}
            className="px-4 py-3 sm:px-6 sm:py-3 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-sm sm:text-base font-medium shadow-lg transition-all duration-200 flex items-center gap-2 min-w-[100px] sm:min-w-[120px]"
          >
            <span>←</span>
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          <button
            onClick={next}
            className="px-4 py-3 sm:px-6 sm:py-3 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-sm sm:text-base font-medium shadow-lg transition-all duration-200 flex items-center gap-2 min-w-[100px] sm:min-w-[120px]"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <span>→</span>
          </button>
        </div>
      </div>
      
      <footer className="mt-16 sm:mt-20 md:mt-24 mb-8 text-center text-xs sm:text-sm text-purple-300 opacity-80">
        <p>© {new Date().getFullYear()} Celestial Insights. All celestial rights reserved.</p>
      </footer>
      </div>
    </div>
  );
};

export default KundliGenerator;