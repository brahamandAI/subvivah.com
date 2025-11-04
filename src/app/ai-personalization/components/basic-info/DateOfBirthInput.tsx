'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';

interface DateOfBirthInputProps {
  value: any;
  onNext: (value: { dateOfBirth: string }) => void;
  onBack: () => void;
}

const DateOfBirthInput: React.FC<DateOfBirthInputProps> = ({ value, onNext, onBack }) => {
  const { language } = useLanguage();
  const [dateStr, setDateStr] = useState<string>(
    value.dateOfBirth ? value.dateOfBirth.slice(0, 10) : ''
  );

  // Calculate min/max dates for age 18-100
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, 11, 31); // Dec 31, 18 years ago
  const minDate = new Date(today.getFullYear() - 100, 0, 1); // Jan 1, 100 years ago

  const getAge = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateStr) {
      onNext({ dateOfBirth: new Date(dateStr).toISOString() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ModernDatePicker
        label={language === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}
        value={dateStr}
        onChange={setDateStr}
        minDate={minDate}
        maxDate={maxDate}
        required
        placeholder={language === 'hi' ? 'अपनी जन्म तिथि चुनें' : 'Select your date of birth'}
        helpText={language === 'hi' ? 'आयु 18-100 वर्ष के बीच होनी चाहिए' : 'Age must be between 18 and 100 years'}
      />

      {dateStr && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white/70"
        >
          {language === 'hi' 
            ? `आपकी उम्र: ${getAge(dateStr)} वर्ष`
            : `Your age: ${getAge(dateStr)} years`
          }
        </motion.div>
      )}
      <div className="flex justify-between">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          {language === 'hi' ? 'वापस' : 'Back'}
        </motion.button>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors"
          disabled={!dateStr}
        >
          {language === 'hi' ? 'अगला' : 'Next'}
        </motion.button>
      </div>
    </form>
  );
};

export default DateOfBirthInput; 