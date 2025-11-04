'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import SpeakingAvatar from './SpeakingAvatar';

interface ShardQuestionsScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

interface ShardQuestion {
  id: string;
  title: { hi: string; en: string };
  description: { hi: string; en: string };
  options: Array<{
    id: string;
    label: { hi: string; en: string };
    icon: string;
    value: string;
  }>;
}

const shardQuestions: ShardQuestion[] = [
  {
    id: 'food_preference',
    title: { hi: '🍽️ आपकी खाने की पसंद क्या है?', en: '🍽️ What\'s your food preference?' },
    description: { 
      hi: 'खाने की पसंद दैनिक जीवन और परिवार में स्वीकृति को प्रभावित करती है।', 
      en: 'Food choices strongly influence daily compatibility and family acceptance.' 
    },
    options: [
      { id: 'vegetarian', label: { hi: '🥗 शाकाहारी', en: '🥗 Vegetarian' }, icon: '🥗', value: 'vegetarian' },
      { id: 'non_vegetarian', label: { hi: '🍗 मांसाहारी', en: '🍗 Non-Vegetarian' }, icon: '🍗', value: 'non_vegetarian' },
      { id: 'eggetarian', label: { hi: '🥚 अंडाशाकाहारी', en: '🥚 Eggetarian' }, icon: '🥚', value: 'eggetarian' },
      { id: 'vegan', label: { hi: '🌱 शुद्ध शाकाहारी', en: '🌱 Vegan' }, icon: '🌱', value: 'vegan' },
      { id: 'no_preference', label: { hi: '❌ कोई पसंद नहीं', en: '❌ No Preference' }, icon: '❌', value: 'no_preference' }
    ]
  },
  {
    id: 'sleep_schedule',
    title: { hi: '🌄 आप सुबह या रात के व्यक्ति हैं?', en: '🌄 Are you a morning or night person?' },
    description: { 
      hi: 'दैनिक दिनचर्या और ऊर्जा स्तर को मिलाने में मदद करता है।', 
      en: 'Helps match daily routines and energy levels.' 
    },
    options: [
      { id: 'morning', label: { hi: '🌞 सुबह के शौकीन', en: '🌞 Morning Lover' }, icon: '🌞', value: 'morning' },
      { id: 'night', label: { hi: '🌙 रात के उल्लू', en: '🌙 Night Owl' }, icon: '🌙', value: 'night' },
      { id: 'flexible', label: { hi: '⏰ लचीला', en: '⏰ Flexible' }, icon: '⏰', value: 'flexible' }
    ]
  },
  {
    id: 'social_personality',
    title: { hi: '👥 आपकी सामाजिक व्यक्तित्व क्या है?', en: '👥 What best describes your social personality?' },
    description: { 
      hi: 'बातचीत के तरीके और जीवनशैली के संरेखण को दर्शाता है।', 
      en: 'Indicates interaction style and lifestyle alignment.' 
    },
    options: [
      { id: 'extrovert', label: { hi: '🗣️ बहिर्मुखी', en: '🗣️ Extrovert' }, icon: '🗣️', value: 'extrovert' },
      { id: 'introvert', label: { hi: '🤫 अंतर्मुखी', en: '🤫 Introvert' }, icon: '🤫', value: 'introvert' },
      { id: 'ambivert', label: { hi: '😌 मिश्रित', en: '😌 Ambivert' }, icon: '😌', value: 'ambivert' }
    ]
  },
  {
    id: 'religion_spirituality',
    title: { hi: '🛐 आपके लिए धर्म/आध्यात्मिकता कितना महत्वपूर्ण है?', en: '🛐 How important is religion/spirituality to you?' },
    description: { 
      hi: 'सांस्कृतिक मूल्यों और परिवार की परंपराओं पर संरेखण।', 
      en: 'Aligns on cultural values and family traditions.' 
    },
    options: [
      { id: 'very_important', label: { hi: '🙏 बहुत महत्वपूर्ण', en: '🙏 Very Important' }, icon: '🙏', value: 'very_important' },
      { id: 'somewhat_spiritual', label: { hi: '🧘‍♀️ कुछ आध्यात्मिक', en: '🧘‍♀️ Somewhat Spiritual' }, icon: '🧘‍♀️', value: 'somewhat_spiritual' },
      { id: 'not_spiritual', label: { hi: '🚫 आध्यात्मिक नहीं', en: '🚫 Not Spiritual' }, icon: '🚫', value: 'not_spiritual' },
      { id: 'open_to_all', label: { hi: '🌍 सभी विश्वासों के लिए खुला', en: '🌍 Open to All Beliefs' }, icon: '🌍', value: 'open_to_all' }
    ]
  },
  {
    id: 'relationship_type',
    title: { hi: '👫 आप किस तरह का रिश्ता चाहते हैं?', en: '👫 What kind of relationship are you looking for?' },
    description: { 
      hi: 'भूमिकाओं, भावनात्मक जरूरतों और जीवनशैली के अनुरूप उम्मीदों को प्रकट करता है।', 
      en: 'Reveals expectations around roles, emotional needs, and lifestyle fit.' 
    },
    options: [
      { id: 'emotionally_deep', label: { hi: '💞 भावनात्मक रूप से गहरा', en: '💞 Emotionally Deep' }, icon: '💞', value: 'emotionally_deep' },
      { id: 'equal_supportive', label: { hi: '🤝 समान और सहायक', en: '🤝 Equal & Supportive' }, icon: '🤝', value: 'equal_supportive' },
      { id: 'traditional_roles', label: { hi: '🏠 पारंपरिक भूमिकाएं', en: '🏠 Traditional Roles' }, icon: '🏠', value: 'traditional_roles' },
      { id: 'fun_spontaneous', label: { hi: '🎉 मज़ेदार और स्वाभाविक', en: '🎉 Fun & Spontaneous' }, icon: '🎉', value: 'fun_spontaneous' }
    ]
  },
  {
    id: 'career_priority',
    title: { hi: '💼 आपकी करियर प्राथमिकता क्या है?', en: '💼 What\'s your career priority?' },
    description: { 
      hi: 'जीवन में काम, परिवार और संतुलन की प्राथमिकता को समझने में मदद करता है।', 
      en: 'Helps understand priorities between work, family, and balance in life.' 
    },
    options: [
      { id: 'work_first', label: { hi: '💼 काम पहले', en: '💼 Work-first' }, icon: '💼', value: 'work_first' },
      { id: 'balance', label: { hi: '⚖️ संतुलन', en: '⚖️ Balance' }, icon: '⚖️', value: 'balance' },
      { id: 'family_first', label: { hi: '👨‍👩‍👧‍👦 परिवार पहले', en: '👨‍👩‍👧‍👦 Family-first' }, icon: '👨‍👩‍👧‍👦', value: 'family_first' }
    ]
  },
  {
    id: 'children_preference',
    title: { hi: '👶 बच्चों के बारे में आपकी क्या राय है?', en: '👶 What\'s your preference about children?' },
    description: { 
      hi: 'परिवार नियोजन और भविष्य की योजनाओं को समझने में मदद करता है।', 
      en: 'Helps understand family planning and future goals.' 
    },
    options: [
      { id: 'want_kids', label: { hi: '✅ बच्चे चाहिए', en: '✅ Want kids' }, icon: '✅', value: 'want_kids' },
      { id: 'no_kids', label: { hi: '❌ बच्चे नहीं चाहिए', en: '❌ Don\'t want kids' }, icon: '❌', value: 'no_kids' },
      { id: 'open_to_both', label: { hi: '🤔 दोनों के लिए खुला', en: '🤔 Open to both' }, icon: '🤔', value: 'open_to_both' }
    ]
  },
  {
    id: 'living_setup',
    title: { hi: '🏠 आप किस तरह का रहने का सेटअप पसंद करेंगे?', en: '🏠 What living setup do you prefer?' },
    description: { 
      hi: 'परिवार के साथ रहने या स्वतंत्र जीवन की पसंद को समझने में मदद करता है।', 
      en: 'Helps understand preference for living with family or independently.' 
    },
    options: [
      { id: 'independent', label: { hi: '🏡 स्वतंत्र', en: '🏡 Independent' }, icon: '🏡', value: 'independent' },
      { id: 'with_family', label: { hi: '👨‍👩‍👧‍👦 परिवार के साथ', en: '👨‍👩‍👧‍👦 With family' }, icon: '👨‍👩‍👧‍👦', value: 'with_family' },
      { id: 'open', label: { hi: '🤝 खुला', en: '🤝 Open' }, icon: '🤝', value: 'open' }
    ]
  },
  {
    id: 'relocation_flexibility',
    title: { hi: '🌍 आप कहाँ तक जाने के लिए तैयार हैं?', en: '🌍 How far are you willing to relocate?' },
    description: { 
      hi: 'भौगोलिक लचीलेपन और यात्रा की इच्छा को समझने में मदद करता है।', 
      en: 'Helps understand geographical flexibility and travel willingness.' 
    },
    options: [
      { id: 'same_city', label: { hi: '🏙️ एक ही शहर', en: '🏙️ Same city' }, icon: '🏙️', value: 'same_city' },
      { id: 'same_country', label: { hi: '🇮🇳 एक ही देश', en: '🇮🇳 Same country' }, icon: '🇮🇳', value: 'same_country' },
      { id: 'anywhere', label: { hi: '🌍 कहीं भी', en: '🌍 Anywhere' }, icon: '🌍', value: 'anywhere' }
    ]
  },
  {
    id: 'marriage_timeline',
    title: { hi: '🎯 आपकी शादी की समयसीमा क्या है?', en: '🎯 What\'s your marriage timeline?' },
    description: { 
      hi: 'शादी के लिए तैयारी और समय की प्राथमिकता को समझने में मदद करता है।', 
      en: 'Helps understand readiness and timeline priority for marriage.' 
    },
    options: [
      { id: 'immediately', label: { hi: '⚡ तुरंत', en: '⚡ Immediately' }, icon: '⚡', value: 'immediately' },
      { id: 'in_1_year', label: { hi: '📅 1 साल में', en: '📅 In 1 year' }, icon: '📅', value: 'in_1_year' },
      { id: 'open_timeline', label: { hi: '🕐 खुली समयसीमा', en: '🕐 Open timeline' }, icon: '🕐', value: 'open_timeline' }
    ]
  },
  {
    id: 'relationship_intent',
    title: { hi: '🧡 आप यहाँ क्या खोज रहे हैं?', en: '🧡 What are you hoping to find here?' },
    description: { 
      hi: 'रिश्ते के इरादे और लक्ष्यों को समझने में मदद करता है।', 
      en: 'Helps understand relationship intentions and goals.' 
    },
    options: [
      { id: 'serious_marriage', label: { hi: '🧡 गंभीर रिश्ता (शादी तक)', en: '🧡 Serious relationship leading to marriage' }, icon: '🧡', value: 'serious_marriage' },
      { id: 'exploring', label: { hi: '👀 सिर्फ जांच रहे हैं', en: '👀 Just exploring' }, icon: '👀', value: 'exploring' },
      { id: 'self_growth', label: { hi: '🧘 आत्म-विकास + देखते हैं', en: '🧘 Self-growth + see where it goes' }, icon: '🧘', value: 'self_growth' },
      { id: 'friendship_first', label: { hi: '👥 पहले दोस्ती', en: '👥 Friendship first' }, icon: '👥', value: 'friendship_first' }
    ]
  }
];

export default function ShardQuestionsScreen({ onNext, onBack, initialData }: ShardQuestionsScreenProps) {
  const { language } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    const audioElement = new Audio('/selection_beep.mp3');
    setAudio(audioElement);
  }, []);

  const currentQuestion = shardQuestions[currentQuestionIndex];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    
    // Play sound effect
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }
    // Immediately submit and go to next
    setTimeout(() => {
      const newAnswers = { ...answers, [currentQuestion.id]: optionId };
      setAnswers(newAnswers);
      setSelectedOption(null);
      if (currentQuestionIndex < shardQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        onNext({ shardAnswers: newAnswers });
      }
    }, 200); // slight delay for animation/sound
  };

  const handleNext = () => {
    if (selectedOption) {
      const newAnswers = { ...answers, [currentQuestion.id]: selectedOption };
      setAnswers(newAnswers);
      setSelectedOption(null);

      if (currentQuestionIndex < shardQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // All questions completed
        onNext({ shardAnswers: newAnswers });
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(answers[shardQuestions[currentQuestionIndex - 1].id] || null);
    } else {
      onBack();
    }
  };

  const progress = ((currentQuestionIndex + 1) / shardQuestions.length) * 100;

  const TEXT = {
    hi: {
      title: 'अपनी पसंद चुनें',
      subtitle: 'हर सवाल आपकी प्रोफ़ाइल को बेहतर बनाने में मदद करेगा',
      next: 'अगला',
      back: 'पीछे',
      skip: 'छोड़ें',
      question: 'प्रश्न',
      of: 'का'
    },
    en: {
      title: 'Choose Your Preferences',
      subtitle: 'Each question helps build a better profile for you',
      next: 'Next',
      back: 'Back',
      skip: 'Skip',
      question: 'Question',
      of: 'of'
    }
  };

  const t = TEXT[language];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-sm">
              {t.question} {currentQuestionIndex + 1} {t.of} {shardQuestions.length}
            </span>
            <span className="text-white/80 text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence initial={false}>
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Question */}
            <div className="text-center mb-8 mt-6">
              <h1 className="text-3xl font-bold text-white mb-4">
                {currentQuestion.title[language]}
              </h1>
              <p className="text-purple-200 text-lg max-w-2xl mx-auto">
                {currentQuestion.description[language]}
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <AnimatePresence>
                {currentQuestion.options.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionSelect(option.id)}
                    className={`relative cursor-pointer rounded-xl p-6 transition-all duration-300 ${
                      selectedOption === option.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {/* Selection indicator */}
                    {selectedOption === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-sm">✓</span>
                      </motion.div>
                    )}

                    <div className="text-center">
                      <div className="text-4xl mb-3">{option.icon}</div>
                      <h3 className="text-lg font-semibold mb-2">
                        {option.label[language]}
                      </h3>
                    </div>

                    {/* Blur effect for unselected cards */}
                    {selectedOption && selectedOption !== option.id && (
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
            className="px-6 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors"
          >
            {t.back}
          </motion.button>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNext({ shardAnswers: answers })}
              className="px-6 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors"
            >
              {t.skip}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
} 