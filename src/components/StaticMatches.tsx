'use client';

import { Sparkles, Star, UserPlus, MessageCircle, Lock } from 'lucide-react';

const STATIC_MATCHES = [
  {
    name: "Priya S.",
    age: 26,
    location: "Delhi, India",
    matchScore: 95,
    highlights: ["Similar family values", "Compatible lifestyle", "Same mother tongue"],
    education: "MBA Finance",
    interests: ["Yoga", "Cooking", "Art"]
  },
  {
    name: "Neha R.",
    age: 27,
    location: "Bangalore, India",
    matchScore: 89,
    highlights: ["Similar education", "Compatible goals", "Same cultural background"],
    education: "Data Scientist",
    interests: ["Dancing", "Photography", "Fitness"]
  }
];

export default function StaticMatches() {
  const handleInteraction = () => {
    try {
      console.log('Attempting to show register popup from StaticMatches');
      if (typeof window !== 'undefined') {
        if (typeof window.showRegisterPopup === 'function') {
          window.showRegisterPopup();
        } else {
          console.error('showRegisterPopup function is not available');
          // Try to initialize it if not available
          window.showRegisterPopup = () => {
            console.log('Register popup triggered from StaticMatches initialization');
            // Since we can't access the DelayedLoginModal's state here,
            // we'll reload the page which will trigger the auth check
            window.location.reload();
          };
          window.showRegisterPopup();
        }
      }
    } catch (error) {
      console.error('Error showing register popup:', error);
      // Fallback to reload the page if popup fails
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-3">
          <Sparkles className="text-yellow-400" />
          Your Perfect Matches
          <Sparkles className="text-yellow-400" />
        </h1>
        <p className="text-lg sm:text-xl text-purple-200 mb-8">
          Discover compatible partners who share your values, interests, and life goals
        </p>
      </div>

      {/* Match Stats Preview */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-pink-400 mb-2">150+</div>
          <p className="text-purple-200">Daily Compatible Matches</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-pink-400 mb-2">92%</div>
          <p className="text-purple-200">Match Success Rate</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-pink-400 mb-2">10k+</div>
          <p className="text-purple-200">Happy Couples</p>
        </div>
      </div>

      {/* Featured Matches */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">Today's Featured Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STATIC_MATCHES.map((match, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300" onClick={handleInteraction}>
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 relative">
                <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-80" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white blur-[4px]">{match.name}</h3>
                  <div className="bg-pink-600/20 text-pink-400 px-3 py-1 rounded-full text-sm blur-[4px]">
                    {match.matchScore}% Match
                  </div>
                </div>
                <p className="text-purple-200 text-sm mb-4 blur-[4px]">
                  {match.age} years • {match.location}
                </p>
                <div className="space-y-2 mb-4">
                  {match.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-purple-200 text-sm blur-[4px]">{highlight}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                  {match.interests.map((interest, i) => (
                    <span key={i} className="bg-purple-600/20 text-purple-200 px-3 py-1 rounded-full text-sm blur-[4px]">
                      {interest}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInteraction();
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Connect
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInteraction();
                    }}
                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto text-center bg-white/10 backdrop-blur-sm rounded-xl p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Meet Your Soulmate?</h2>
        <p className="text-lg text-purple-200 mb-6">
          Create an account now to view your matches and start your journey towards finding true love
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