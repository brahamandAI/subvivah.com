'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import CityAutocomplete from '@/components/CityAutocomplete';
import { MapPin } from 'lucide-react';

interface LocationInputProps {
  value: any;
  onNext: (value: { location: string }) => void;
  onBack: () => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ value, onNext, onBack }) => {
  const { language } = useLanguage();
  const [location, setLocation] = useState(value.location || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onNext({ location: location.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <CityAutocomplete
            value={location}
            onChange={setLocation}
            required
          />
        </div>

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 rounded-lg overflow-hidden bg-white/5 border border-white/10"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-sm">
                {language === 'hi' 
                  ? 'मानचित्र जल्द ही आ रहा है'
                  : 'Map coming soon'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
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
          disabled={!location.trim()}
        >
          {language === 'hi' ? 'अगला' : 'Next'}
        </motion.button>
      </div>
    </form>
  );
};

export default LocationInput; 