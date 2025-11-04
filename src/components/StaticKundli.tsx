'use client';

import { Star, Moon, Sun, Sparkles, Lock } from 'lucide-react';

const ZODIAC_SIGNS = [
  { name: "Aries", dates: "Mar 21 - Apr 19", element: "Fire", ruler: "Mars" },
  { name: "Taurus", dates: "Apr 20 - May 20", element: "Earth", ruler: "Venus" },
  { name: "Gemini", dates: "May 21 - Jun 20", element: "Air", ruler: "Mercury" },
  { name: "Cancer", dates: "Jun 21 - Jul 22", element: "Water", ruler: "Moon" },
];

export default function StaticKundli() {
  const handleInteraction = () => {
    if (typeof window !== 'undefined' && typeof (window as any).showRegisterPopup === 'function') {
      (window as any).showRegisterPopup();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-3">
          <Moon className="text-blue-400" />
          Celestial Birth Chart
          <Sun className="text-yellow-400" />
        </h1>
        <p className="text-lg sm:text-xl text-purple-200 mb-8">
          Discover your cosmic blueprint and understand your life's journey through Vedic astrology
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleInteraction}
        >
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Detailed Analysis</h3>
          <p className="text-purple-200">Get comprehensive insights about your personality, career, and relationships</p>
        </div>

        <div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleInteraction}
        >
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Moon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Planetary Positions</h3>
          <p className="text-purple-200">Understand the influence of planets on your life path</p>
        </div>

        <div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleInteraction}
        >
          <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Match Making</h3>
          <p className="text-purple-200">Find compatible partners based on your birth chart</p>
        </div>
      </div>

      {/* Zodiac Preview */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">Zodiac Signs & Their Elements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ZODIAC_SIGNS.map((sign, index) => (
            <div 
              key={index} 
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 relative cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={handleInteraction}
            >
              <Lock className="absolute top-4 right-4 text-purple-300/50" />
              <h3 className="text-xl font-semibold text-white mb-2">{sign.name}</h3>
              <div className="space-y-2 text-purple-200 text-sm">
                <p>Dates: {sign.dates}</p>
                <p>Element: {sign.element}</p>
                <p>Ruler: {sign.ruler}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Chart */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">Sample Birth Chart</h2>
        <div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 relative cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={handleInteraction}
        >
          <div className="aspect-square max-w-lg mx-auto bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-lg relative">
            <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white/50" />
            <div className="absolute inset-0 border-2 border-purple-300/20 rounded-lg"></div>
            <div className="absolute inset-4 border-2 border-purple-300/20 rounded-lg"></div>
            <div className="absolute inset-8 border-2 border-purple-300/20 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Unlock CTA */}
      <div className="max-w-3xl mx-auto text-center bg-white/10 backdrop-blur-sm rounded-xl p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Unlock Your Celestial Journey</h2>
        <p className="text-lg text-purple-200 mb-6">
          Create an account to generate your personalized birth chart and discover your cosmic destiny
        </p>
        <button 
          onClick={handleInteraction}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
} 