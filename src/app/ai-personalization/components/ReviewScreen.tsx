'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import SpeakingAvatar from './SpeakingAvatar';
import { FaUser, FaGraduationCap, FaBriefcase, FaHome, FaHeart, FaLightbulb } from 'react-icons/fa';

interface ReviewScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  formData: any;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({
  onNext,
  onBack,
  formData,
}) => {
  const { language } = useLanguage();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function generateReview() {
      try {
        const response = await fetch('/api/generate-profile-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData,
            language
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate review');
        }

        const data = await response.json();
        setReview(data);
      } catch (error) {
        console.error('Error generating review:', error);
        setError('Failed to generate profile review. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    generateReview();
  }, [formData, language]);

  const TEXT = {
    hi: {
      title: 'प्रोफाइल रिव्यू',
      subtitle: 'आपकी प्रोफाइल का विश्लेषण',
      personalityAnalysis: 'व्यक्तित्व विश्लेषण',
      keyStrengths: 'मुख्य शक्तियां',
      compatibilityFactors: 'संगतता कारक',
      lifestyleInsights: 'जीवनशैली अंतर्दृष्टि',
      relationshipPotential: 'संबंध क्षमता',
      next: 'अगला',
      back: 'वापस',
      loading: 'प्रोफाइल रिव्यू तैयार हो रहा है...',
      error: 'प्रोफाइल रिव्यू तैयार करने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
    },
    en: {
      title: 'Profile Review',
      subtitle: 'Analysis of your profile',
      personalityAnalysis: 'Personality Analysis',
      keyStrengths: 'Key Strengths',
      compatibilityFactors: 'Compatibility Factors',
      lifestyleInsights: 'Lifestyle Insights',
      relationshipPotential: 'Relationship Potential',
      next: 'Next',
      back: 'Back',
      loading: 'Preparing your profile review...',
      error: 'Error generating profile review. Please try again.'
    }
  };

  const t = TEXT[language];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center min-h-[70vh]"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mb-4"></div>
        <div className="text-white/80">{t.loading}</div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center min-h-[70vh]"
      >
        <div className="text-red-400 font-semibold mb-4">{t.error}</div>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          {t.back}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto p-4"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <SpeakingAvatar 
          text={language === 'hi' ? 'आपकी प्रोफाइल का विश्लेषण' : 'Analysis of your profile'} 
          size="md" 
        />

        <div className="mt-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
              <FaUser className="text-pink-500" />
              {t.personalityAnalysis}
            </h3>
            <p className="text-white/80 leading-relaxed">
              {review?.personalityAnalysis}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
              <FaLightbulb className="text-pink-500" />
              {t.keyStrengths}
            </h3>
            <ul className="space-y-2">
              {Array.isArray(review?.keyStrengths)
                ? review.keyStrengths.map((strength: string, index: number) => (
                    <li key={index} className="text-white/80 flex items-start gap-2">
                      <span className="text-pink-500">•</span>
                      {strength}
                    </li>
                  ))
                : review?.keyStrengths
                  ? <li className="text-white/80 flex items-start gap-2">
                      <span className="text-pink-500">•</span>
                      {review.keyStrengths}
                    </li>
                  : null
              }
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
              <FaHeart className="text-pink-500" />
              {t.compatibilityFactors}
            </h3>
            <ul className="space-y-2">
              {Array.isArray(review?.compatibilityFactors)
                ? review.compatibilityFactors.map((factor: string, index: number) => (
                    <li key={index} className="text-white/80 flex items-start gap-2">
                      <span className="text-pink-500">•</span>
                      {factor}
                    </li>
                  ))
                : review?.compatibilityFactors
                  ? <li className="text-white/80 flex items-start gap-2">
                      <span className="text-pink-500">•</span>
                      {review.compatibilityFactors}
                    </li>
                  : null
              }
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
              <FaHome className="text-pink-500" />
              {t.lifestyleInsights}
            </h3>
            <ul className="space-y-2">
              {Array.isArray(review?.lifestyleInsights)
                ? review.lifestyleInsights.map((insight: string, index: number) => (
                    <li key={index} className="text-white/80 flex items-start gap-2">
                      <span className="text-pink-500">•</span>
                      {insight}
                    </li>
                  ))
                : review?.lifestyleInsights
                  ? <li className="text-white/80 flex items-start gap-2">
                      <span className="text-pink-500">•</span>
                      {review.lifestyleInsights}
                    </li>
                  : null
              }
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
              <FaBriefcase className="text-pink-500" />
              {t.relationshipPotential}
            </h3>
            <p className="text-white/80 leading-relaxed">
              {review?.relationshipPotential}
            </p>
          </motion.div>
        </div>

        <div className="mt-8 flex justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            {t.back}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
          >
            {t.next}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewScreen; 