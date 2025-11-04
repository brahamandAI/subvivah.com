'use client';

import { useState } from 'react';

export default function Membership() {
  const [isPremium, setIsPremium] = useState(false);

  const features = {
    free: [
      'Create basic profile',
      'Upload up to 4 photos',
      'Basic search filters',
      'Send 5 interests per day',
      'View limited profile details',
      'Basic horoscope matching'
    ],
    premium: [
      'Unlimited photo uploads',
      'Advanced search filters',
      'Unlimited interests',
      'Priority customer support',
      'View complete profile details',
      'Advanced horoscope matching',
      'Profile highlighting',
      'See who viewed your profile',
      'Advanced privacy settings',
      'Profile boost features'
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Choose Your Membership</h2>
        <p className="mt-2 sm:mt-4 text-base sm:text-xl text-gray-600">
          Upgrade to premium for enhanced features and better matches
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Free Membership */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-6 sm:px-6 sm:py-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Free Membership</h3>
            <p className="mt-2 sm:mt-4 text-gray-600">Basic features to get started</p>
            <div className="mt-6 sm:mt-8">
              <ul className="space-y-3 sm:space-y-4">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Premium Membership */}
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-6 sm:px-6 sm:py-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Premium Membership</h3>
                <p className="mt-2 sm:mt-4 text-red-100">Enhanced features for better matches</p>
              </div>
              <div className="bg-white text-red-600 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold">
                Popular
              </div>
            </div>
            <div className="mt-6 sm:mt-8">
              <ul className="space-y-3 sm:space-y-4">
                {features.premium.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-white">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 sm:mt-8">
              <button
                onClick={() => setIsPremium(true)}
                className="w-full bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition duration-300"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Features */}
      <div className="mt-12 sm:mt-16">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">Safety Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Profile Verification</h4>
            <p className="text-gray-600">All profiles are verified through multiple checks</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Photo Verification</h4>
            <p className="text-gray-600">Profile photos are verified for authenticity</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Secure Messaging</h4>
            <p className="text-gray-600">End-to-end encrypted messaging system</p>
          </div>
        </div>
      </div>
    </div>
  );
} 