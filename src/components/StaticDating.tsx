'use client';

import { Coffee, Star, Lock } from 'lucide-react';

const STATIC_SUGGESTIONS = [
  {
    name: "Cafe After Hours",
    location: "Sector-12 Dwarka Delhi",
    rating: 4.8,
    ambiance: "Romantic",
    cuisine: "Italian & Continental",
    priceRange: "₹₹"
  },
  {
    name: "Panache",
    location: "Sector 17 Dwarka Delhi",
    rating: 4.6,
    ambiance: "Cozy & Elegant",
    cuisine: "Multi-cuisine",
    priceRange: "₹₹₹"
  },
  {
    name: "Symposium World Cuisine",
    location: "Sector-12 Dwarka Delhi",
    rating: 4.7,
    ambiance: "Modern & Chic",
    cuisine: "World Cuisine",
    priceRange: "₹₹₹"
  }
];

export default function StaticDating() {
  const handleInteraction = () => {
    try {
      console.log('Attempting to show register popup from StaticDating');
      if (typeof window !== 'undefined') {
        if (typeof window.showRegisterPopup === 'function') {
          window.showRegisterPopup();
        } else {
          console.error('showRegisterPopup function is not available');
          // Try to initialize it if not available
          window.showRegisterPopup = () => {
            console.log('Register popup triggered from StaticDating initialization');
            // Since we can't access the DelayedLoginModal's state here,
            // we'll reload the page which will trigger the auth check
            window.location.reload();
          };
          window.showRegisterPopup();
        }
      }
    } catch (error) {
      console.error('Error showing register popup:', error);
      // Fallback: reload page to trigger popup
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-3">
          <Coffee className="text-yellow-400" />
          Discover Fine Dining
          <Coffee className="text-yellow-400" />
        </h1>
        <p className="text-lg sm:text-xl text-purple-200 mb-8">
          Experience exquisite cuisine at the most enchanting venues in town
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleInteraction}
        >
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Curated Venues</h3>
          <p className="text-purple-200">Handpicked selection of the finest restaurants and cafes for your dining pleasure</p>
        </div>

        <div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleInteraction}
        >
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Premium Experience</h3>
          <p className="text-purple-200">Exceptional service and ambiance at every featured establishment</p>
        </div>

        <div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleInteraction}
        >
          <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Easy Booking</h3>
          <p className="text-purple-200">Simple and quick table reservations at your favorite venues</p>
        </div>
      </div>

      {/* Featured Venues */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">Featured Dining Venues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STATIC_SUGGESTIONS.map((venue, index) => (
            <div 
              key={index} 
              className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={handleInteraction}
            >
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 relative">
                <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-50" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{venue.name}</h3>
                <p className="text-purple-200 text-sm mb-2">{venue.location}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-purple-200">{venue.rating}</span>
                </div>
                <p className="text-purple-200 text-sm">{venue.ambiance} • {venue.cuisine}</p>
                <p className="text-purple-200 text-sm">{venue.priceRange}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto text-center bg-white/10 backdrop-blur-sm rounded-xl p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Make a Reservation?</h2>
        <p className="text-lg text-purple-200 mb-6">
          Create an account now to book your table at these exclusive dining venues
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