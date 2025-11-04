import React from 'react';
import { Moon, Sun, Stars } from 'lucide-react';

const KundliIntro: React.FC = () => {
  return (
    <div className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-500/30 mb-8 mt-8">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <Stars className="text-amber-300" size={20} />
        <span>What is a Birth Chart?</span>
      </h2>
      
      <div className="space-y-4 text-purple-100">
        <p>
          A birth chart (also known as a Kundli, natal chart, or astrological chart) is a celestial snapshot of the 
          universe at the moment of your birth. It reveals the precise position of each planet, the Sun, the Moon, 
          and mathematical points of significance.
        </p>
        
        <div className="flex items-center justify-center py-3">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-purple-400/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 border border-blue-400/20 rounded-full"></div>
            <div className="absolute inset-4 border border-amber-400/30 rounded-full"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Sun className="text-amber-300" size={16} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
              <Moon className="text-blue-200" size={16} />
            </div>
          </div>
        </div>
        
        <p>
          This celestial blueprint serves as a guide to understanding your personality traits, strengths, 
          challenges, and potential life path. It provides insights into various aspects of your life, including:
        </p>
        
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li className="text-amber-200">Personality and character traits</li>
          <li className="text-blue-200">Emotional tendencies and patterns</li>
          <li className="text-rose-200">Career aptitudes and life purpose</li>
          <li className="text-green-200">Relationship compatibility and patterns</li>
        </ul>
        
        <p className="text-sm text-purple-300/80 italic">
          Enter your accurate birth details to generate your personalized birth chart and discover 
          the cosmic influences that shape your journey.
        </p>
      </div>
    </div>
  );
};

export default KundliIntro;