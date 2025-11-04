"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import SpeakingAvatar from '@/app/ai-personalization/components/SpeakingAvatar';
import { Brain, Heart, Sparkles, Users } from 'lucide-react';

interface PersonalityIntroScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const PersonalityIntroScreen: React.FC<PersonalityIntroScreenProps> = ({ 
  onNext, 
  onBack, 
  initialData 
}) => {
  const { language } = useLanguage();
  const [selectedFocus, setSelectedFocus] = useState<string>('');

  const focusAreas = [
    {
      id: 'personality',
      title: { hi: 'व्यक्तित्व विश्लेषण', en: 'Personality Analysis' },
      description: { 
        hi: 'अपने व्यक्तित्व लक्षणों और चरित्र को समझें', 
        en: 'Understand your personality traits and character' 
      },
      icon: <Brain className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'interests',
      title: { hi: 'रुचियां और शौक', en: 'Interests & Hobbies' },
      description: { 
        hi: 'अपनी रुचियों और जीवनशैली को खोजें', 
        en: 'Discover your interests and lifestyle' 
      },
      icon: <Heart className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'relationships',
      title: { hi: 'संबंध मूल्य', en: 'Relationship Values' },
      description: { 
        hi: 'अपने संबंधों के प्रति दृष्टिकोण और मूल्य', 
        en: 'Your approach and values towards relationships' 
      },
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-violet-500'
    },
    {
      id: 'comprehensive',
      title: { hi: 'समग्र विश्लेषण', en: 'Comprehensive Analysis' },
      description: { 
        hi: 'सभी पहलुओं का विस्तृत विश्लेषण', 
        en: 'Detailed analysis of all aspects' 
      },
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const TEXT = {
    hi: {
      title: 'AI व्यक्तित्व विश्लेषण',
      subtitle: 'अपने व्यक्तित्व को बेहतर तरीके से समझें',
      description: 'AI आपके व्यक्तित्व, रुचियों और मूल्यों का विश्लेषण करके आपकी प्रोफ़ाइल को बेहतर बनाएगा। यह आपको बेहतर मैच खोजने में मदद करेगा।',
      selectFocus: 'अपना फोकस क्षेत्र चुनें',
      next: 'शुरू करें',
      back: 'वापस'
    },
    en: {
      title: 'AI Personality Analysis',
      subtitle: 'Better understand your personality',
      description: 'AI will analyze your personality, interests, and values to enhance your profile. This will help you find better matches.',
      selectFocus: 'Choose your focus area',
      next: 'Get Started',
      back: 'Back'
    }
  };

  const t = TEXT[language];

  const handleSubmit = () => {
    if (selectedFocus) {
      onNext({ focusArea: selectedFocus });
    }
  };

  const avatarText = {
    hi: 'आइए आपके व्यक्तित्व का विश्लेषण करें। यह आपकी प्रोफ़ाइल को और भी आकर्षक बनाएगा।',
    en: 'Let\'s analyze your personality. This will make your profile even more attractive.'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto p-4"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        <SpeakingAvatar text={avatarText[language]} size="md" />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-purple-200 mb-4">{t.subtitle}</p>
          <p className="text-purple-300 max-w-2xl mx-auto leading-relaxed">
            {t.description}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            {t.selectFocus}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {focusAreas.map((area, index) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedFocus(area.id)}
                className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
                  selectedFocus === area.id
                    ? 'border-purple-400 bg-white/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${area.color} text-white`}>
                    {area.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {area.title[language]}
                    </h3>
                    <p className="text-sm text-purple-200 leading-relaxed">
                      {area.description[language]}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            {language === 'hi' ? 'लाभ' : 'Benefits'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="text-white font-medium mb-1">
                {language === 'hi' ? 'बेहतर मैच' : 'Better Matches'}
              </h4>
              <p className="text-sm text-purple-200">
                {language === 'hi' 
                  ? 'व्यक्तित्व-आधारित मिलान'
                  : 'Personality-based matching'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✨</span>
              </div>
              <h4 className="text-white font-medium mb-1">
                {language === 'hi' ? 'आकर्षक प्रोफ़ाइल' : 'Attractive Profile'}
              </h4>
              <p className="text-sm text-purple-200">
                {language === 'hi'
                  ? 'AI-जनरेटेड सारांश'
                  : 'AI-generated summaries'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💝</span>
              </div>
              <h4 className="text-white font-medium mb-1">
                {language === 'hi' ? 'गहरी समझ' : 'Deeper Understanding'}
              </h4>
              <p className="text-sm text-purple-200">
                {language === 'hi'
                  ? 'अपने बारे में अधिक जानें'
                  : 'Learn more about yourself'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors"
          >
            {t.back}
          </motion.button>

          <motion.button
            type="button"
            disabled={!selectedFocus}
            onClick={handleSubmit}
            whileHover={{ scale: selectedFocus ? 1.02 : 1 }}
            whileTap={{ scale: selectedFocus ? 0.98 : 1 }}
            className={`flex-1 px-6 py-3 rounded-full font-semibold transition-colors ${
              selectedFocus
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-500 hover:to-purple-500'
                : 'bg-white/10 text-white/50 cursor-not-allowed'
            }`}
          >
            {t.next}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalityIntroScreen; 