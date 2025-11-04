'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import SpeakingAvatar from './SpeakingAvatar';
import { useLanguage } from '@/context/LanguageContext';

interface WelcomeScreenProps {
  onNext: (data: any) => void;
  onBack?: () => void;
}

interface UserData {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
}

export default function WelcomeScreen({ onNext, onBack = () => {} }: WelcomeScreenProps) {
  const { language, setLanguage } = useLanguage();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = () => {
    if (!userData) return '';
    return `${userData.firstName} ${userData.lastName}`.trim();
  };

  const getGreeting = () => {
    const name = getUserName();
    if (language === 'hi') {
      return name ? `नमस्कार ${name}!` : 'नमस्कार!';
    } else {
      return name ? `Hello ${name}!` : 'Hello!';
    }
  };

  const TEXT = {
    hi: {
      welcomeMessage: userData ? `नमस्कार ${getUserName()}! Subvivah AI में आपका स्वागत है।` : "नमस्कार! Subvivah AI में आपका स्वागत है।",
      title: userData ? `नमस्कार ${getUserName()}!` : 'नमस्कार! Subvivah AI में आपका स्वागत है।',
      description: 'मैं आपकी पसंद समझने में आपकी मदद करूंगी।',
      begin: 'शुरू करें',
    },
    en: {
      welcomeMessage: userData ? `Hello ${getUserName()}! Welcome to Subvivah AI.` : "Welcome to Subvivah AI!",
      title: userData ? `Hello ${getUserName()}!` : 'Welcome to Subvivah AI!',
      description: 'I will help you understand your preferences.',
      begin: 'Begin',
    }
  };
  const t = TEXT[language];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center min-h-[70vh] relative max-w-4xl mx-auto px-4"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mb-4"></div>
        <div className="text-white/80">
          {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[70vh] relative max-w-4xl mx-auto px-4"
    >
      <SpeakingAvatar text={t.welcomeMessage} size="lg" />

      <h1 className="text-4xl font-bold text-center mb-4 mt-8 text-white">
        {t.title}
      </h1>
      
      <p className="text-xl text-purple-200 text-center mb-4 max-w-2xl">
        {t.description}
      </p>

      {/* Time Estimate and Features */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4 text-center">
          {language === 'hi' ? 'आपको क्या मिलेगा' : 'What you\'ll get'}
        </h3>
        <div className="space-y-3 text-sm text-purple-200">
          <div className="flex items-center gap-3">
            <span className="text-pink-400">⏰</span>
            <span>{language === 'hi' ? '~15 मिनट में पूरा करें' : '~15 minutes to complete'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-pink-400">⏭️</span>
            <span>{language === 'hi' ? 'वैकल्पिक चरणों को छोड़ें' : 'Skip optional steps'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-pink-400">💾</span>
            <span>{language === 'hi' ? 'ऑटो-सेव सुरक्षा' : 'Auto-save protection'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-pink-400">🤖</span>
            <span>{language === 'hi' ? 'AI-संचालित मैचिंग' : 'AI-powered matching'}</span>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-pink-500 hover:to-purple-500 transition-colors"
        onClick={() => onNext({})}
      >
        {t.begin}
      </motion.button>

      {/* Trust Indicators */}
      <div className="mt-6 flex items-center gap-6 text-sm text-purple-300">
        <div className="flex items-center gap-2">
          <span>🔒</span>
          <span>{language === 'hi' ? 'सुरक्षित डेटा' : 'Secure Data'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>✨</span>
          <span>{language === 'hi' ? 'स्मार्ट सुझाव' : 'Smart Suggestions'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>💝</span>
          <span>{language === 'hi' ? 'बेहतर मैच' : 'Better Matches'}</span>
        </div>
      </div>
    </motion.div>
  );
} 