'use client';

import { Heart, Star, Lock, Sparkles, UserPlus, MessageCircle, Brain, ThumbsUp } from 'lucide-react';

const STATIC_PERSONALIZED_MATCHES = [
  {
    name: "Priya S.",
    age: 27,
    location: "Delhi, India",
    matchScore: 98,
    personalityMatch: ["Extroverted", "Career-focused", "Family-oriented"],
    interests: ["Reading", "Yoga", "Travel"],
    aiInsights: ["Similar life goals", "Compatible communication styles", "Shared values"]
  },
  {
    name: "Neha R.",
    age: 26,
    location: "Mumbai, India",
    matchScore: 96,
    personalityMatch: ["Creative", "Ambitious", "Traditional"],
    interests: ["Photography", "Cooking", "Music"],
    aiInsights: ["Matching energy levels", "Compatible lifestyles", "Similar spiritual beliefs"]
  },
  {
    name: "Riya M.",
    age: 28,
    location: "Bangalore, India",
    matchScore: 95,
    personalityMatch: ["Intellectual", "Adventure-loving", "Balanced"],
    interests: ["Hiking", "Art", "Technology"],
    aiInsights: ["Complementary personalities", "Shared future vision", "Similar social preferences"]
  }
];

export default function StaticPersonalizedMatches() {
  const handleInteraction = () => {
    try {
      console.log('Attempting to show register popup from StaticPersonalizedMatches');
      if (typeof window !== 'undefined') {
        if (typeof window.showRegisterPopup === 'function') {
          window.showRegisterPopup();
        } else {
          console.error('showRegisterPopup function is not available');
          window.showRegisterPopup = () => {
            console.log('Register popup triggered from StaticPersonalizedMatches initialization');
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
          <Brain className="text-yellow-400" />
          AI-Powered Matches
          <Sparkles className="text-yellow-400" />
        </h1>
        <p className="text-lg sm:text-xl text-purple-200 mb-8">
          Discover deeply compatible partners selected by our advanced AI matching system
        </p>
      </div>

      {/* AI Stats Preview */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-pink-400 mb-2">95%</div>
          <p className="text-purple-200">AI Match Accuracy</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-pink-400 mb-2">12+</div>
          <p className="text-purple-200">Personality Factors</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-pink-400 mb-2">8k+</div>
          <p className="text-purple-200">AI-Matched Couples</p>
        </div>
      </div>

      {/* Featured AI Matches */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">Today's AI-Curated Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STATIC_PERSONALIZED_MATCHES.map((match, index) => (
            <div 
              key={index} 
              className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={handleInteraction}
            >
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 relative">
                <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-80" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white blur-[4px]">{match.name}</h3>
                  <div className="bg-pink-600/20 text-pink-400 px-3 py-1 rounded-full text-sm">
                    {match.matchScore}% AI Match
                  </div>
                </div>
                <p className="text-purple-200 text-sm mb-4 blur-[4px]">
                  {match.age} years • {match.location}
                </p>
                <div className="space-y-2 mb-4">
                  {match.aiInsights.map((insight, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-yellow-400" />
                      <span className="text-purple-200 text-sm blur-[4px]">{insight}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                  {match.personalityMatch.map((trait, i) => (
                    <span key={i} className="bg-purple-600/20 text-purple-200 px-3 py-1 rounded-full text-sm blur-[4px]">
                      {trait}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInteraction();
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  View Full Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto text-center bg-white/10 backdrop-blur-sm rounded-xl p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Experience AI-Powered Matchmaking</h2>
        <p className="text-lg text-purple-200 mb-6">
          Create an account now to unlock personalized matches selected by our advanced AI algorithm
        </p>
        <button 
          onClick={handleInteraction}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <Brain className="w-5 h-5" />
          Get Started
        </button>
      </div>
    </div>
  );
} 