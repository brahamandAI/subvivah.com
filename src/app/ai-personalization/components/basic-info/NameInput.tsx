'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

interface NameInputProps {
  value: any;
  onNext: (value: { name: string }) => void;
  onBack: () => void;
}

const NameInput: React.FC<NameInputProps> = ({ value, onNext, onBack }) => {
  const { language } = useLanguage();
  const [name, setName] = useState(value.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNext({ name: name.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={language === 'hi' ? 'पूरा नाम' : 'Full Name'}
        className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg text-white placeholder-purple-300"
        required
      />
      
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
          disabled={!name.trim()}
        >
          {language === 'hi' ? 'अगला' : 'Next'}
        </motion.button>
      </div>
    </form>
  );
};

export default NameInput; 