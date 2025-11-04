'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import SpeakingAvatar from '@/app/ai-personalization/components/SpeakingAvatar';
import { ModernInput, ModernSelect } from '@/components/ui/modern-input';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { ModernLocationInput } from '@/components/ui/modern-location-input';
import { Calendar, MapPin, User } from 'lucide-react';

interface ImprovedBasicInfoScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const ImprovedBasicInfoScreen: React.FC<ImprovedBasicInfoScreenProps> = ({ 
  onNext, 
  onBack, 
  initialData 
}) => {
  const { language } = useLanguage();
  
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    location: initialData?.location || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({
    location: ['Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Chennai, India'],
  });

  const TEXT = {
    hi: {
      title: 'मूलभूत जानकारी',
      subtitle: 'आइए आपके बारे में जानें',
      fullName: 'पूरा नाम',
      dateOfBirth: 'जन्मतिथि',
      location: 'स्थान',
      helpTexts: {
        fullName: 'वही नाम दर्ज करें जो आपके दस्तावेजों में है',
        location: 'आप वर्तमान में कहाँ रहते हैं',
      },
      next: 'अगला',
      back: 'वापस',
      errors: {
        fullName: 'कृपया अपना पूरा नाम दर्ज करें',
        dateOfBirth: 'कृपया वैध जन्मतिथि दर्ज करें',
        location: 'कृपया अपना स्थान दर्ज करें',
      }
    },
    en: {
      title: 'Basic Information',
      subtitle: 'Let\'s get to know you',
      fullName: 'Full Name',
      dateOfBirth: 'Date of Birth',
      location: 'Location',
      helpTexts: {
        fullName: 'Enter the name as it appears on your documents',
        location: 'Where do you currently live',
      },
      next: 'Next',
      back: 'Back',
      errors: {
        fullName: 'Please enter your full name',
        dateOfBirth: 'Please enter a valid date of birth',
        location: 'Please enter your location',
      }
    }
  };

  const t = TEXT[language];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t.errors.fullName;
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t.errors.dateOfBirth;
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18 || age > 100) {
        newErrors.dateOfBirth = language === 'hi' ? 'आयु 18-100 के बीच होनी चाहिए' : 'Age must be between 18-100';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = t.errors.location;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onNext(formData);
    setIsLoading(false);
  };



  const avatarText = {
    hi: 'आइए आपकी बुनियादी जानकारी से शुरुआत करते हैं। यह केवल कुछ मिनट लेगा।',
    en: 'Let\'s start with your basic information. This will only take a few minutes.'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto p-4"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        <SpeakingAvatar text={avatarText[language]} size="md" />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-purple-200">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ModernInput
            label={t.fullName}
            value={formData.fullName}
            onChange={(value) => setFormData(prev => ({ ...prev, fullName: value }))}
            icon={<User className="w-5 h-5" />}
            error={errors.fullName}
            helpText={t.helpTexts.fullName}
            variant="glass"
            required
          />

          <ModernDatePicker
            label={t.dateOfBirth}
            value={formData.dateOfBirth}
            onChange={(value) => setFormData(prev => ({ ...prev, dateOfBirth: value }))}
            error={errors.dateOfBirth}
            variant="glass"
            maxDate={new Date(new Date().getFullYear() - 18, 11, 31)} // 18 years ago
            minDate={new Date(new Date().getFullYear() - 100, 0, 1)} // 100 years ago
            required
          />

          <ModernLocationInput
            label={t.location}
            value={formData.location}
            onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
            error={errors.location}
            helpText={t.helpTexts.location}
            variant="glass"
            countryFilter="in"
            required
          />



          <div className="flex gap-4 pt-4">
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
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-semibold hover:from-pink-500 hover:to-purple-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                />
              ) : (
                t.next
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ImprovedBasicInfoScreen; 