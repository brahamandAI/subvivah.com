'use client';

import { MessageCircle, Heart, Shield, Lock, Users, Bell, CheckCircle2, Key, UserCheck, Clock } from 'lucide-react';

const TRUST_FEATURES = [
  {
    icon: <Shield className="w-8 h-8 text-blue-400" />,
    title: "Secure Communication",
    description: "End-to-end encrypted messaging ensures your conversations remain private and protected"
  },
  {
    icon: <UserCheck className="w-8 h-8 text-green-400" />,
    title: "Verified Profiles",
    description: "All members are thoroughly verified to ensure authentic connections"
  },
  {
    icon: <Key className="w-8 h-8 text-purple-400" />,
    title: "Privacy Controls",
    description: "Customize your privacy settings and control who can contact you"
  },
  {
    icon: <Clock className="w-8 h-8 text-pink-400" />,
    title: "Response Time",
    description: "Quick response indicators help maintain active conversations"
  }
];

const BENEFITS = [
  {
    title: "Meaningful Connections",
    description: "Build genuine relationships with like-minded individuals"
  },
  {
    title: "Safe Environment",
    description: "Our moderation team ensures a respectful communication space"
  },
  {
    title: "Privacy First",
    description: "Your personal information is never shared without your consent"
  },
  {
    title: "Quality Matches",
    description: "Connect with people who share your values and interests"
  }
];

export default function StaticMessages() {
  const handleInteraction = () => {
    try {
      console.log('Attempting to show register popup from StaticMessages');
      if (typeof window !== 'undefined') {
        if (typeof window.showRegisterPopup === 'function') {
          window.showRegisterPopup();
        } else {
          console.error('showRegisterPopup function is not available');
          window.showRegisterPopup = () => {
            console.log('Register popup triggered from StaticMessages initialization');
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 flex items-center justify-center gap-3">
              <MessageCircle className="text-blue-400" />
              Secure Messaging
              <Heart className="text-pink-400" />
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 mb-12">
              Connect safely and build meaningful relationships through our trusted platform
            </p>
            <div 
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-3xl mx-auto cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={handleInteraction}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-purple-600/30 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-purple-200" />
                </div>
                <p className="text-lg text-purple-200 mb-4">
                  Create an account to start connecting with your matches through our secure messaging system
                </p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInteraction();
                  }}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors select-none"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Why Trust Our Platform?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST_FEATURES.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-all duration-300 select-none cursor-pointer"
              onClick={handleInteraction}
            >
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-purple-200">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Benefits of Our Messaging System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 select-none">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-purple-200">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Connecting?
          </h2>
          <p className="text-lg text-purple-200 mb-8">
            Join our trusted community and begin your journey to meaningful relationships
          </p>
          <button
            onClick={handleInteraction}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors select-none"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
} 