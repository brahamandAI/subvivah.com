'use client';

import { Sparkles, Heart, Lock, Star, MessageCircle, UserPlus } from 'lucide-react';

const DAILY_SUGGESTIONS = [
  {
    name: "Priya S.",
    age: 26,
    location: "Delhi",
    matchScore: 95,
    highlight: "Loves yoga and meditation",
    interests: ["Spirituality", "Fitness", "Reading"]
  },
  {
    name: "Neha R.",
    age: 27,
    location: "Mumbai",
    matchScore: 92,
    highlight: "Passionate about cooking",
    interests: ["Cooking", "Travel", "Photography"]
  },
  {
    name: "Riya M.",
    age: 25,
    location: "Bangalore",
    matchScore: 89,
    highlight: "Adventure seeker",
    interests: ["Hiking", "Art", "Technology"]
  }
];

export default function DailySuggestionBubble() {
  const handleInteraction = () => {
    try {
      console.log('Attempting to show register popup from DailySuggestionBubble');
      if (typeof window !== 'undefined') {
        if (typeof window.showRegisterPopup === 'function') {
          window.showRegisterPopup();
        } else {
          console.error('showRegisterPopup function is not available');
          window.showRegisterPopup = () => {
            console.log('Register popup triggered from DailySuggestionBubble initialization');
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
          Daily Suggestions
          <Heart className="text-pink-400" />
        </h1>
        <p className="text-lg sm:text-xl text-purple-200 mb-8">
          Discover new potential matches handpicked for you every day
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleInteraction}
        >
          <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Curated Matches</h3>
          <p className="text-purple-200">Daily suggestions based on your preferences and compatibility</p>
        </div>

        <div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleInteraction}
        >
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">High Compatibility</h3>
          <p className="text-purple-200">Matches with 85%+ compatibility scores for better connections</p>
        </div>

        <div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleInteraction}
        >
          <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Fresh Connections</h3>
          <p className="text-purple-200">New profiles added daily to expand your dating pool</p>
        </div>
      </div>

      {/* Daily Suggestions */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">Today's Suggestions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DAILY_SUGGESTIONS.map((suggestion, index) => (
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
                  <h3 className="text-xl font-semibold text-white blur-[4px]">{suggestion.name}</h3>
                  <div className="bg-pink-600/20 text-pink-400 px-3 py-1 rounded-full text-sm">
                    {suggestion.matchScore}% Match
                  </div>
                </div>
                <p className="text-purple-200 text-sm mb-2 blur-[4px]">
                  {suggestion.age} years • {suggestion.location}
                </p>
                <p className="text-purple-200 text-sm mb-4 blur-[4px]">
                  {suggestion.highlight}
                </p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {suggestion.interests.map((interest, i) => (
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
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Get Daily Match Suggestions</h2>
        <p className="text-lg text-purple-200 mb-6">
          Create an account now to receive personalized daily suggestions and find your perfect match
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