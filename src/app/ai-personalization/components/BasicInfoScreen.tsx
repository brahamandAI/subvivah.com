'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import SpeakingAvatar from './SpeakingAvatar';
import { useLanguage } from '@/context/LanguageContext';
import NameInput from './basic-info/NameInput';
import DateOfBirthInput from './basic-info/DateOfBirthInput';
import LocationInput from './basic-info/LocationInput';

interface BasicInfoScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

const BasicInfoScreen: React.FC<BasicInfoScreenProps> = ({ onNext, onBack, initialData }) => {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    location: initialData?.location || '',
  });

  const steps = [
    {
      component: NameInput,
      title: { hi: 'आपका पूरा नाम क्या है?', en: 'What is your full name?' },
    },
    {
      component: DateOfBirthInput,
      title: { hi: 'आपकी जन्मतिथि क्या है?', en: 'What is your date of birth?' },
    },
    {
      component: LocationInput,
      title: { hi: 'आप कहाँ रहते हैं?', en: 'Where are you located?' },
    },
  ];

  const CurrentStep = steps[step].component;

  const handleNext = (value: any) => {
    const key = Object.keys(value)[0];
    setFormData(prev => ({ ...prev, [key]: value[key] }));
    
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onNext(formData);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      onBack();
    } else {
      setStep(prev => prev - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-xl mx-auto p-6"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <SpeakingAvatar text={steps[step].title[language]} size="md" />
        
        <div className="mt-6">
          <CurrentStep
            value={formData}
            onNext={handleNext}
            onBack={handleBack}
          />
        </div>

        {/* Progress indicator */}
        <div className="flex justify-between items-center mt-8 text-white/70 text-sm">
          <span>Step {step + 1} of {steps.length}</span>
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === step
                    ? 'bg-pink-500'
                    : index < step
                    ? 'bg-green-500'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BasicInfoScreen; 