"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Heart, GraduationCap, Briefcase, MapPin, DollarSign, Users, Home } from 'lucide-react';
import SpeakingAvatar from '@/app/ai-personalization/components/SpeakingAvatar';

interface PreferencesScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ onNext, onBack, initialData }) => {
  const { language } = useLanguage();
  const [preferences, setPreferences] = useState({
    ageRange: initialData?.ageRange || '',
    education: initialData?.education || '',
    occupation: initialData?.occupation || '',
    location: initialData?.location || '',
    income: initialData?.income || '',
    familyType: initialData?.familyType || '',
    lifestyle: initialData?.lifestyle || '',
    values: initialData?.values || '',
  });

  const educationLevels = [
    { value: 'high_school', label: { hi: 'हाई स्कूल', en: 'High School' } },
    { value: 'bachelors', label: { hi: 'स्नातक', en: 'Bachelor\'s' } },
    { value: 'masters', label: { hi: 'स्नातकोत्तर', en: 'Master\'s' } },
    { value: 'phd', label: { hi: 'पीएचडी', en: 'PhD' } },
  ];

  const familyTypes = [
    { value: 'nuclear', label: { hi: 'एकल परिवार', en: 'Nuclear Family' } },
    { value: 'joint', label: { hi: 'संयुक्त परिवार', en: 'Joint Family' } },
    { value: 'any', label: { hi: 'कोई भी', en: 'Any' } },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(preferences);
  };

  const avatarText = {
    hi: 'अपनी पसंद के बारे में बताएं',
    en: 'Tell us about your preferences'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto p-4"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
        <SpeakingAvatar text={avatarText[language]} size="md" />
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Age Range */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white/90 text-sm">
              <Heart className="w-4 h-4" />
              <span>{language === 'hi' ? 'आयु सीमा' : 'Age Range'}</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
  
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="18"
                max="100"
              />
              <input
                type="number"
  
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="18"
                max="100"
              />
            </div>
          </div>

          {/* Education & Occupation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white/90 text-sm">
                <GraduationCap className="w-4 h-4" />
                <span>{language === 'hi' ? 'शिक्षा' : 'Education'}</span>
              </label>
              <select
                value={preferences.education}
                onChange={(e) => setPreferences(prev => ({ ...prev, education: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white [&>option]:text-slate-900 placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">{language === 'hi' ? 'शिक्षा चुनें' : 'Select education'}</option>
                {educationLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label[language]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white/90 text-sm">
                <Briefcase className="w-4 h-4" />
                <span>{language === 'hi' ? 'व्यवसाय' : 'Occupation'}</span>
              </label>
              <input
                type="text"
                value={preferences.occupation}
                onChange={(e) => setPreferences(prev => ({ ...prev, occupation: e.target.value }))}
    
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location & Income */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white/90 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{language === 'hi' ? 'स्थान' : 'Location'}</span>
              </label>
              <input
                type="text"
                value={preferences.location}
                onChange={(e) => setPreferences(prev => ({ ...prev, location: e.target.value }))}
    
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white/90 text-sm">
                <DollarSign className="w-4 h-4" />
                <span>{language === 'hi' ? 'आय' : 'Income'}</span>
              </label>
              <input
                type="text"
                value={preferences.income}
                onChange={(e) => setPreferences(prev => ({ ...prev, income: e.target.value }))}
    
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Family Type & Lifestyle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white/90 text-sm">
                <Users className="w-4 h-4" />
                <span>{language === 'hi' ? 'परिवार का प्रकार' : 'Family Type'}</span>
              </label>
              <select
                value={preferences.familyType}
                onChange={(e) => setPreferences(prev => ({ ...prev, familyType: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white [&>option]:text-slate-900 placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">{language === 'hi' ? 'परिवार का प्रकार चुनें' : 'Select family type'}</option>
                {familyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label[language]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white/90 text-sm">
                <Home className="w-4 h-4" />
                <span>{language === 'hi' ? 'जीवनशैली' : 'Lifestyle'}</span>
              </label>
              <input
                type="text"
                value={preferences.lifestyle}
                onChange={(e) => setPreferences(prev => ({ ...prev, lifestyle: e.target.value }))}
    
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Values */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white/90 text-sm">
              <Heart className="w-4 h-4" />
              <span>{language === 'hi' ? 'मूल्य' : 'Values'}</span>
            </label>
            <textarea
              value={preferences.values}
              onChange={(e) => setPreferences(prev => ({ ...prev, values: e.target.value }))}
  
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-between mt-6">
            <motion.button
              type="button"
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              {language === 'hi' ? 'वापस' : 'Back'}
            </motion.button>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors text-sm"
            >
              {language === 'hi' ? 'अगला' : 'Next'}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default PreferencesScreen; 