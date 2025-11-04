"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Briefcase, Building2, Calendar, MapPin, Award, DollarSign } from 'lucide-react';
import SpeakingAvatar from '@/app/ai-personalization/components/SpeakingAvatar';

interface WorkExperienceScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const WorkExperienceScreen: React.FC<WorkExperienceScreenProps> = ({ onNext, onBack, initialData }) => {
  const { language } = useLanguage();
  const [experience, setExperience] = useState({
    type: initialData?.type || '',
    company: initialData?.company || '',
    position: initialData?.position || '',
    location: initialData?.location || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    salary: initialData?.salary || '',
    achievements: initialData?.achievements || '',
  });

  const experienceTypes = [
    { value: 'student', label: { hi: 'छात्र', en: 'Student' } },
    { value: 'it_software', label: { hi: 'आईटी/सॉफ्टवेयर', en: 'IT/Software' } },
    { value: 'education', label: { hi: 'शिक्षा/शिक्षण', en: 'Education/Teaching' } },
    { value: 'corporate', label: { hi: 'कॉर्पोरेट', en: 'Corporate' } },
    { value: 'business', label: { hi: 'व्यवसाय/उद्यमी', en: 'Business/Entrepreneur' } },
    { value: 'other', label: { hi: 'अन्य', en: 'Other' } },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (experience.type) {
      onNext(experience);
    }
  };

  const avatarText = {
    hi: 'अपने कार्य अनुभव के बारे में बताएं',
    en: 'Tell us about your work experience'
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
          {/* Experience Type Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {experienceTypes.map((type) => (
              <motion.button
                key={type.value}
                type="button"
                onClick={() => setExperience(prev => ({ ...prev, type: type.value }))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg text-center transition-all ${
                  experience.type === type.value
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white/90 hover:bg-white/20'
                }`}
              >
                {type.label[language]}
              </motion.button>
            ))}
          </div>

          {experience.type && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              {/* Company & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <Building2 className="w-4 h-4" />
                    <span>{language === 'hi' ? 'कंपनी' : 'Company'}</span>
                  </label>
                  <input
                    type="text"
                    value={experience.company}
                    onChange={(e) => setExperience(prev => ({ ...prev, company: e.target.value }))}
      
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <Briefcase className="w-4 h-4" />
                    <span>{language === 'hi' ? 'पद' : 'Position'}</span>
                  </label>
                  <input
                    type="text"
                    value={experience.position}
                    onChange={(e) => setExperience(prev => ({ ...prev, position: e.target.value }))}
      
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{language === 'hi' ? 'स्थान' : 'Location'}</span>
                  </label>
                  <input
                    type="text"
                    value={experience.location}
                    onChange={(e) => setExperience(prev => ({ ...prev, location: e.target.value }))}
      
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <DollarSign className="w-4 h-4" />
                    <span>{language === 'hi' ? 'वेतन' : 'Salary'}</span>
                  </label>
                  <input
                    type="text"
                    value={experience.salary}
                    onChange={(e) => setExperience(prev => ({ ...prev, salary: e.target.value }))}
      
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{language === 'hi' ? 'शुरुआत की तारीख' : 'Start Date'}</span>
                  </label>
                  <input
                    type="month"
                    value={experience.startDate}
                    onChange={(e) => setExperience(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{language === 'hi' ? 'अंतिम तारीख' : 'End Date'}</span>
                  </label>
                  <input
                    type="month"
                    value={experience.endDate}
                    onChange={(e) => setExperience(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/90 text-sm">
                  <Award className="w-4 h-4" />
                  <span>{language === 'hi' ? 'उपलब्धियां' : 'Achievements'}</span>
                </label>
                <textarea
                  value={experience.achievements}
                  onChange={(e) => setExperience(prev => ({ ...prev, achievements: e.target.value }))}
      
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </motion.div>
          )}

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
              disabled={!experience.type}
            >
              {language === 'hi' ? 'अगला' : 'Next'}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default WorkExperienceScreen; 