"use client";
import React, { useState, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';

// Dynamically import components
const WelcomeScreen = dynamic(() => import('./components/WelcomeScreen'), { ssr: false });
const ShardQuestionsScreen = dynamic(() => import('./components/ShardQuestionsScreen'), { ssr: false });
const PersonalizedQuestionsScreen = dynamic(() => import('./components/PersonalizedQuestionsScreen'), { ssr: false });
const ProfileSummaryScreen = dynamic(() => import('./components/ProfileSummaryScreen'), { ssr: false });

interface FormData {
  gender?: string;
  fullName?: string;
  education?: string;
  workExperience?: string;
  family?: string;
  preferences?: string;
  shardAnswers?: Record<string, string>;
  personalizedAnswers?: Record<string, string>;
  profileSummary?: any;
  [key: string]: any;
}

interface UserData {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
}

export default function AIRegistration() {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleNext = (data: FormData) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);
    
    if (currentStep < screens.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps completed
      console.log('AI Personalization completed with data:', newFormData);
      
      // Check if AI personalization is completed
      if (newFormData.isCompleted) {
        // Redirect to profile page
        setTimeout(() => {
          window.location.href = '/profile';
        }, 2000);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { id: 0, name: { hi: 'स्वागत', en: 'Welcome' }, isOptional: false },
    { id: 1, name: { hi: 'प्रश्न', en: 'Questions' }, isOptional: false },
    { id: 2, name: { hi: 'व्यक्तिगत प्रश्न', en: 'Personalized' }, isOptional: false },
    { id: 3, name: { hi: 'सारांश', en: 'Summary' }, isOptional: false },
  ];

  const screens = [
    <WelcomeScreen key="welcome" onNext={handleNext} />,
    <ShardQuestionsScreen 
      key="shard-questions" 
      onNext={handleNext} 
      onBack={handleBack}
      initialData={formData}
    />,
    <PersonalizedQuestionsScreen 
      key="personalized-questions" 
      onNext={handleNext} 
      onBack={handleBack}
      initialData={{ shardAnswers: formData.shardAnswers || {} }}
    />,
    <ProfileSummaryScreen 
      key="profile-summary" 
      onNext={handleNext} 
      onBack={handleBack}
      initialData={{ 
        shardAnswers: formData.shardAnswers || {}, 
        personalizedAnswers: formData.personalizedAnswers || {} 
      }}
    />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 relative pb-32">
      {/* Ensure complete background coverage */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 -z-10 h-full min-h-screen"></div>
      <div className="absolute top-0 left-0 w-full min-h-full bg-gradient-to-br from-purple-900/80 to-pink-900/80 -z-20"></div>
      
      {/* Main Content */}
      <div className="flex flex-col justify-center items-center min-h-screen">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full"
          >
            {screens[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 