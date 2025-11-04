"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import SpeakingAvatar from './SpeakingAvatar';

interface PersonalityPreferencesScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const PersonalityPreferencesScreen: React.FC<PersonalityPreferencesScreenProps> = ({
  onNext,
  onBack,
  initialData,
}) => {
  const { language } = useLanguage();
  const [selectedPreferences, setSelectedPreferences] = useState<Record<string, string>>(
    initialData?.personalityPreferences || {}
  );

  const preferences = [
    {
      id: 'coffee_tea',
      title: {
        en: 'Coffee or Tea?',
        hi: 'कॉफी या चाय?'
      },
      options: [
        { id: 'coffee', label: { en: 'Coffee', hi: 'कॉफी' }, icon: '☕' },
        { id: 'tea', label: { en: 'Tea', hi: 'चाय' }, icon: '🫖' }
      ]
    },
    {
      id: 'morning_night',
      title: {
        en: 'Morning Person or Night Owl?',
        hi: 'सुबह के व्यक्ति या रात के उल्लू?'
      },
      options: [
        { id: 'morning', label: { en: 'Morning Person', hi: 'सुबह के व्यक्ति' }, icon: '🌅' },
        { id: 'night', label: { en: 'Night Owl', hi: 'रात के उल्लू' }, icon: '🌙' }
      ]
    },
    {
      id: 'introvert_extrovert',
      title: {
        en: 'Introvert or Extrovert?',
        hi: 'अंतर्मुखी या बहिर्मुखी?'
      },
      options: [
        { id: 'introvert', label: { en: 'Introvert', hi: 'अंतर्मुखी' }, icon: '🤫' },
        { id: 'extrovert', label: { en: 'Extrovert', hi: 'बहिर्मुखी' }, icon: '🗣️' }
      ]
    },
    {
      id: 'planner_spontaneous',
      title: {
        en: 'Planner or Spontaneous?',
        hi: 'योजनाकार या स्वतःस्फूर्त?'
      },
      options: [
        { id: 'planner', label: { en: 'Planner', hi: 'योजनाकार' }, icon: '📝' },
        { id: 'spontaneous', label: { en: 'Spontaneous', hi: 'स्वतःस्फूर्त' }, icon: '✨' }
      ]
    },
    {
      id: 'adventure_comfort',
      title: {
        en: 'Adventure or Comfort?',
        hi: 'साहस या आराम?'
      },
      options: [
        { id: 'adventure', label: { en: 'Adventure', hi: 'साहस' }, icon: '🏔️' },
        { id: 'comfort', label: { en: 'Comfort', hi: 'आराम' }, icon: '🛋️' }
      ]
    },
    {
      id: 'music_movies',
      title: {
        en: 'Music or Movies?',
        hi: 'संगीत या फिल्में?'
      },
      options: [
        { id: 'music', label: { en: 'Music', hi: 'संगीत' }, icon: '🎵' },
        { id: 'movies', label: { en: 'Movies', hi: 'फिल्में' }, icon: '🎬' }
      ]
    }
  ];

  const handleSelect = (preferenceId: string, optionId: string) => {
    setSelectedPreferences(prev => ({
      ...prev,
      [preferenceId]: optionId
    }));
  };

  const handleSubmit = () => {
    onNext({ personalityPreferences: selectedPreferences });
  };

  const TEXT = {
    hi: {
      title: 'आपकी पसंद',
      subtitle: 'अपनी पसंद चुनें',
      next: 'अगला',
      back: 'वापस'
    },
    en: {
      title: 'Your Preferences',
      subtitle: 'Choose your preferences',
      next: 'Next',
      back: 'Back'
    }
  };

  const t = TEXT[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto p-4"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <SpeakingAvatar 
          text={language === 'hi' ? 'अपनी पसंद चुनें' : 'Choose your preferences'} 
          size="md" 
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {preferences.map((preference, index) => (
            <motion.div
              key={preference.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold text-white/90 mb-4">
                {preference.title[language]}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {preference.options.map(option => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(preference.id, option.id)}
                    className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      selectedPreferences[preference.id] === option.id
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label[language]}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
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
            onClick={handleSubmit}
            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
          >
            {t.next}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalityPreferencesScreen; 