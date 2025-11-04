"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import SpeakingAvatar from '@/app/ai-personalization/components/SpeakingAvatar';
import { ModernSelect, ModernInput } from '@/components/ui/modern-input';
import { GraduationCap, School, Calendar } from 'lucide-react';

interface EducationScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const EducationScreen: React.FC<EducationScreenProps> = ({ onNext, onBack, initialData }) => {
  const { language } = useLanguage();
  const [education, setEducation] = useState({
    degree: initialData?.degree || '',
    institution: initialData?.institution || '',
    yearOfCompletion: initialData?.yearOfCompletion || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const degrees = [
    { value: 'high_school', label: { hi: 'हाई स्कूल', en: 'High School' } },
    { value: 'bachelors', label: { hi: 'स्नातक', en: 'Bachelor\'s' } },
    { value: 'masters', label: { hi: 'स्नातकोत्तर', en: 'Master\'s' } },
    { value: 'phd', label: { hi: 'पीएचडी', en: 'PhD' } },
    { value: 'diploma', label: { hi: 'डिप्लोमा', en: 'Diploma' } },
    { value: 'other', label: { hi: 'अन्य', en: 'Other' } },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1970 + 1 },
    (_, i) => currentYear - i
  );

  const TEXT = {
    hi: {
      title: 'शिक्षा',
      subtitle: 'अपनी शैक्षणिक योग्यता बताएं',
      degree: 'डिग्री',
      institution: 'संस्थान',
      yearOfCompletion: 'पूर्णता वर्ष',
      next: 'अगला',
      back: 'वापस',
      errors: {
        degree: 'कृपया अपनी डिग्री चुनें',
        institution: 'कृपया अपना संस्थान दर्ज करें',
        yearOfCompletion: 'कृपया पूर्णता वर्ष चुनें',
      }
    },
    en: {
      title: 'Education',
      subtitle: 'Tell us about your educational background',
      degree: 'Degree',
      institution: 'Institution',
      yearOfCompletion: 'Year of Completion',
      next: 'Next',
      back: 'Back',
      errors: {
        degree: 'Please select your degree',
        institution: 'Please enter your institution',
        yearOfCompletion: 'Please select year of completion',
      }
    }
  };

  const t = TEXT[language];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!education.degree) {
      newErrors.degree = t.errors.degree;
    }

    if (!education.institution.trim()) {
      newErrors.institution = t.errors.institution;
    }

    if (!education.yearOfCompletion) {
      newErrors.yearOfCompletion = t.errors.yearOfCompletion;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onNext(education);
    }
  };

  const avatarText = {
    hi: 'आपकी शिक्षा के बारे में बताएं',
    en: 'Tell us about your education'
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
          <ModernSelect
            label={t.degree}
            value={education.degree}
            onChange={(value) => setEducation(prev => ({ ...prev, degree: value }))}
            options={degrees.map(degree => ({
              value: degree.value,
              label: degree.label[language]
            }))}

            icon={<GraduationCap className="w-5 h-5" />}
            error={errors.degree}
            variant="glass"
            required
          />

          <ModernInput
            label={t.institution}
            value={education.institution}
            onChange={(value) => setEducation(prev => ({ ...prev, institution: value }))}

            icon={<School className="w-5 h-5" />}
            error={errors.institution}
            variant="glass"
            required
          />

          <ModernSelect
            label={t.yearOfCompletion}
            value={education.yearOfCompletion}
            onChange={(value) => setEducation(prev => ({ ...prev, yearOfCompletion: value }))}
            options={years.map(year => ({
              value: year.toString(),
              label: year.toString()
            }))}

            icon={<Calendar className="w-5 h-5" />}
            error={errors.yearOfCompletion}
            variant="glass"
            required
          />

          <div className="flex gap-4 pt-6">
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-semibold hover:from-pink-500 hover:to-purple-500 transition-colors"
            >
              {t.next}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EducationScreen; 