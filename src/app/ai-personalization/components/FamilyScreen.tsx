"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Users, Home, Heart, Briefcase, GraduationCap, MapPin } from 'lucide-react';
import SpeakingAvatar from '@/app/ai-personalization/components/SpeakingAvatar';

interface FamilyScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const FamilyScreen: React.FC<FamilyScreenProps> = ({ onNext, onBack, initialData }) => {
  const { language } = useLanguage();
  const [family, setFamily] = useState({
    type: initialData?.type || '',
    fatherName: initialData?.fatherName || '',
    fatherOccupation: initialData?.fatherOccupation || '',
    motherName: initialData?.motherName || '',
    motherOccupation: initialData?.motherOccupation || '',
    siblings: initialData?.siblings || '',
    nativePlace: initialData?.nativePlace || '',
    familyIncome: initialData?.familyIncome || '',
    familyType: initialData?.familyType || '',
    familyValues: initialData?.familyValues || '',
  });

  const familyTypes = [
    { value: 'nuclear', label: { hi: 'एकल परिवार', en: 'Nuclear Family' } },
    { value: 'joint', label: { hi: 'संयुक्त परिवार', en: 'Joint Family' } },
    { value: 'extended', label: { hi: 'विस्तारित परिवार', en: 'Extended Family' } },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (family.type) {
      onNext(family);
    }
  };

  const avatarText = {
    hi: 'अपने परिवार के बारे में बताएं',
    en: 'Tell us about your family'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto p-4"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
        {/* Optional Step Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm mb-2">
            <span>⭐</span>
            <span>{language === 'hi' ? 'वैकल्पिक चरण' : 'Optional Step'}</span>
          </div>
          <p className="text-purple-200 text-sm">
            {language === 'hi' 
              ? 'यह चरण वैकल्पिक है। आप चाहें तो इसे छोड़ सकते हैं।'
              : 'This step is optional. You can skip it if you prefer.'
            }
          </p>
        </div>
        
        <SpeakingAvatar text={avatarText[language]} size="md" />
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Family Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {familyTypes.map((type) => (
              <motion.button
                key={type.value}
                type="button"
                onClick={() => setFamily(prev => ({ ...prev, type: type.value }))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg text-center transition-all ${
                  family.type === type.value
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white/90 hover:bg-white/20'
                }`}
              >
                {type.label[language]}
              </motion.button>
            ))}
          </div>

          {family.type && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              {/* Father's Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{language === 'hi' ? 'पिता का नाम' : 'Father\'s Name'}</span>
                  </label>
                  <input
                    type="text"
                    value={family.fatherName}
                    onChange={(e) => setFamily(prev => ({ ...prev, fatherName: e.target.value }))}
        
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <Briefcase className="w-4 h-4" />
                    <span>{language === 'hi' ? 'पिता का व्यवसाय' : 'Father\'s Occupation'}</span>
                  </label>
                  <input
                    type="text"
                    value={family.fatherOccupation}
                    onChange={(e) => setFamily(prev => ({ ...prev, fatherOccupation: e.target.value }))}
        
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Mother's Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{language === 'hi' ? 'माता का नाम' : 'Mother\'s Name'}</span>
                  </label>
                  <input
                    type="text"
                    value={family.motherName}
                    onChange={(e) => setFamily(prev => ({ ...prev, motherName: e.target.value }))}
        
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <Briefcase className="w-4 h-4" />
                    <span>{language === 'hi' ? 'माता का व्यवसाय' : 'Mother\'s Occupation'}</span>
                  </label>
                  <input
                    type="text"
                    value={family.motherOccupation}
                    onChange={(e) => setFamily(prev => ({ ...prev, motherOccupation: e.target.value }))}
        
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Siblings and Native Place */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{language === 'hi' ? 'भाई-बहन' : 'Siblings'}</span>
                  </label>
                  <input
                    type="text"
                    value={family.siblings}
                    onChange={(e) => setFamily(prev => ({ ...prev, siblings: e.target.value }))}
        
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{language === 'hi' ? 'मूल निवास' : 'Native Place'}</span>
                  </label>
                  <input
                    type="text"
                    value={family.nativePlace}
                    onChange={(e) => setFamily(prev => ({ ...prev, nativePlace: e.target.value }))}
        
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Family Income and Values */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <Heart className="w-4 h-4" />
                    <span>{language === 'hi' ? 'पारिवारिक आय' : 'Family Income'}</span>
                  </label>
                  <input
                    type="text"
                    value={family.familyIncome}
                    onChange={(e) => setFamily(prev => ({ ...prev, familyIncome: e.target.value }))}
        
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/90 text-sm">
                    <Home className="w-4 h-4" />
                    <span>{language === 'hi' ? 'पारिवारिक मूल्य' : 'Family Values'}</span>
                  </label>
                  <input
                    type="text"
                    value={family.familyValues}
                    onChange={(e) => setFamily(prev => ({ ...prev, familyValues: e.target.value }))}
        
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-between items-center mt-6">
            <motion.button
              type="button"
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              {language === 'hi' ? 'वापस' : 'Back'}
            </motion.button>

            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={() => onNext({})}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm flex items-center gap-2"
              >
                <span>⏭️</span>
                {language === 'hi' ? 'छोड़ें' : 'Skip'}
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors text-sm"
                disabled={!family.type}
              >
                {language === 'hi' ? 'अगला' : 'Next'}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default FamilyScreen; 