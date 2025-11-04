'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import SpeakingAvatar from './SpeakingAvatar';
import { useLanguage } from '@/context/LanguageContext';

interface SummaryScreenProps {
  onBack: () => void;
  formData: {
    basics: any;
    aiAnswers: string[];
    preferences: Record<number, 'left' | 'right'>;
  };
}

export default function SummaryScreen({ onBack, formData }: SummaryScreenProps) {
  const { language } = useLanguage();
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isGeneratingRef = useRef(false);
  const hasGeneratedRef = useRef(false);

  const generateSummary = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isGeneratingRef.current || hasGeneratedRef.current) {
      return;
    }
    
    isGeneratingRef.current = true;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, language }),
      });

      const data = await response.json();
      setSummary(data.summary);
      hasGeneratedRef.current = true;
    } catch (error) {
      console.error('Error generating summary:', error);
      hasGeneratedRef.current = false; // Allow retry on error
    } finally {
      setIsLoading(false);
      isGeneratingRef.current = false;
    }
  }, [formData, language]);

  useEffect(() => {
    generateSummary();
  }, [generateSummary]);

  const handleSave = async () => {
    try {
      await fetch('/api/user/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          summary,
        }),
      });

      // Redirect to profile page or show success message
      window.location.href = '/profile';
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-purple-200 text-sm sm:text-base">Generating your profile summary...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto px-4 sm:px-6"
    >
      <div className="flex flex-col items-center">
        <SpeakingAvatar
          text={summary}
          size="md"
          showStopButton={true}
          onStopSpeaking={handleSave}
        />

        <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 mt-6 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Your Profile Summary</h3>
          <textarea
            className="w-full h-48 sm:h-64 px-3 sm:px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-purple-300 text-sm sm:text-base"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
  
          />
        </div>

        <div className="flex justify-between w-full">
          <motion.button
            onClick={() => {
              handleSave();
              onBack();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-white/10 text-purple-200 rounded-lg font-semibold hover:bg-white/20 transition-colors text-sm sm:text-base touch-manipulation"
          >
            Back
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 