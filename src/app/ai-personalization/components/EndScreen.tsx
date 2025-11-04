'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import SpeakingAvatar from '@/app/ai-personalization/components/SpeakingAvatar';
import { Home, Check, AlertCircle, Loader2, User, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface EndScreenProps {
  onBack: () => void;
  formData: any;
}

interface ProcessStatus {
  summary: 'pending' | 'success' | 'error';
  database: 'pending' | 'success' | 'error';
}

const EndScreen: React.FC<EndScreenProps> = ({ onBack, formData }) => {
  const { language } = useLanguage();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>({
    summary: 'pending',
    database: 'pending'
  });
  const [generatedSummary, setGeneratedSummary] = useState<string>('');
  const [error, setError] = useState<string>('');

  const TEXT = {
    hi: {
      title: 'प्रोसेसिंग पूरी हो रही है...',
      completedTitle: 'बधाई हो! 🎉',
      subtitle: 'आपका AI विश्लेषण तैयार है',
      processingMessage: 'कृपया धैर्य रखें, हम आपका डेटा प्रोसेस कर रहे हैं...',
      completedMessage: 'आपका AI व्यक्तित्व विश्लेषण पूरा हो गया है। नीचे आपका जेनरेटेड सारांश और एकत्रित डेटा देखें।',
      homeButton: 'होम पर जाएं',
      profileButton: 'प्रोफ़ाइल देखें',
      status: {
        summary: 'AI सारांश जेनरेशन',
        database: 'डेटाबेस में सेव करना'
      },
      success: 'सफलतापूर्वक सेव किया गया! ✅'
    },
    en: {
      title: 'Processing Complete...',
      completedTitle: 'Congratulations! 🎉',
      subtitle: 'Your AI Analysis is Ready',
      processingMessage: 'Please wait while we process your information...',
      completedMessage: 'Your AI personality analysis is complete. Review your generated summary and collected data below.',
      homeButton: 'Go to Home',
      profileButton: 'View Profile',
      status: {
        summary: 'AI Summary Generation',
        database: 'Saving to Database'
      },
      success: 'Successfully saved! ✅'
    }
  };

  const t = TEXT[language];

  useEffect(() => {
    const processData = async () => {
      try {
        if (!formData || Object.keys(formData).length === 0) {
          setError('No data found to process');
          setIsProcessing(false);
          return;
        }

        // Generate AI summary
        await generateSummary(formData);
        
        // Save to database
        await saveToDatabase(formData);

        setIsProcessing(false);
        
      } catch (error) {
        console.error('Error processing data:', error);
        setError('Failed to process data');
        setIsProcessing(false);
      }
    };

    processData();
  }, [formData]);

  const generateSummary = async (data: any) => {
    try {
      // Generate AI summary
      const summaryResponse = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basics: {
            name: data.fullName,
            age: calculateAge(data.dateOfBirth),
            gender: data.gender,
            location: data.location,
            profession: data.profession,
            education: data.degree
          },
          aiAnswers: Object.values(data.interviewResponses || {}),
          preferences: data.personalityPreferences || {},
          language
        })
      });

      if (!summaryResponse.ok) throw new Error('Failed to generate summary');
      
      const { summary } = await summaryResponse.json();
      setGeneratedSummary(summary);
      setProcessStatus(prev => ({ ...prev, summary: 'success' }));
    } catch (error) {
      console.error('Error generating summary:', error);
      setProcessStatus(prev => ({ ...prev, summary: 'error' }));
    }
  };

  const saveToDatabase = async (data: any) => {
    try {
      // Prepare data for database saving
      const saveData = {
        // Basic Info
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        location: data.location,
        
        // Education
        education: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        graduationYear: data.graduationYear,
        
        // Work Experience
        occupation: data.profession,
        company: data.company,
        workLocation: data.workLocation,
        experience: data.experience,
        annualIncome: data.annualIncome,
        
        // Family
        fatherName: data.fatherName,
        fatherOccupation: data.fatherOccupation,
        motherName: data.motherName,
        motherOccupation: data.motherOccupation,
        siblings: data.siblings,
        familyType: data.familyType,
        familyStatus: data.familyStatus,
        
        // Preferences
        ageFrom: data.ageFrom,
        ageTo: data.ageTo,
        heightFrom: data.heightFrom,
        heightTo: data.heightTo,
        preferredEducation: data.preferredEducation,
        preferredOccupation: data.preferredOccupation,
        preferredLocation: data.preferredLocation,
        preferredIncome: data.preferredIncome,
        maritalStatus: data.maritalStatus,
        religion: data.religion,
        caste: data.caste,
        
        // Horoscope
        timeOfBirth: data.timeOfBirth,
        placeOfBirth: data.placeOfBirth,
        rashi: data.rashi,
        nakshatra: data.nakshatra,
        gotra: data.gotra,
        manglik: data.manglik,
        
        // AI Generated
        aiSummary: generatedSummary,
        personalityTraits: data.personalityTraits,
        interests: data.interests
      };

      const response = await fetch('/api/ai-personalization/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save data');
      }

      const result = await response.json();
      console.log('✅ Data saved successfully:', result);
      setProcessStatus(prev => ({ ...prev, database: 'success' }));
    } catch (error) {
      console.error('Error saving to database:', error);
      setProcessStatus(prev => ({ ...prev, database: 'error' }));
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    return today.getFullYear() - birth.getFullYear();
  };

  const StatusItem = ({ icon: Icon, label, status }: { 
    icon: any, 
    label: string, 
    status: 'pending' | 'success' | 'error' 
  }) => (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
      <Icon className="w-5 h-5 text-purple-300" />
      <span className="flex-1 text-white">{label}</span>
      {status === 'pending' && <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />}
      {status === 'success' && <Check className="w-4 h-4 text-green-400" />}
      {status === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
    </div>
  );

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center"
      >
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
        <p className="text-purple-200 mb-6">{error}</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
        >
          Go Back
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[70vh] relative max-w-4xl mx-auto"
    >
      <SpeakingAvatar 
        text={isProcessing 
          ? (language === 'hi' 
              ? 'कृपया धैर्य रखें, हम आपका डेटा प्रोसेस कर रहे हैं...'
              : 'Please wait while we process your information...')
          : (language === 'hi' 
              ? 'आपका AI व्यक्तित्व विश्लेषण पूरा हो गया है!'
              : 'Your AI personality analysis is complete!')} 
        size="lg" 
      />

      <h1 className="text-4xl font-bold text-center mb-2 mt-8 text-white">
        {isProcessing ? t.title : t.completedTitle}
      </h1>
      
      <h2 className="text-2xl text-pink-400 text-center mb-6">
        {t.subtitle}
      </h2>

      {/* Success Indicator */}
      {!isProcessing && processStatus.database === 'success' && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-6">
          <p className="text-green-200 text-center text-sm">
            {t.success}
          </p>
        </div>
      )}

      {isProcessing ? (
        <div className="w-full max-w-md space-y-4 mb-8">
          <p className="text-center text-purple-200 mb-6">{t.processingMessage}</p>
          
          <StatusItem 
            icon={FileText} 
            label={t.status.summary} 
            status={processStatus.summary} 
          />
          
          <StatusItem 
            icon={User} 
            label={t.status.database} 
            status={processStatus.database} 
          />
        </div>
      ) : (
        <div className="text-center w-full">
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            {t.completedMessage}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* AI Generated Summary */}
            {generatedSummary && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-left">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === 'hi' ? 'AI-जेनरेटेड सारांश:' : 'AI-Generated Summary:'}
                </h3>
                <p className="text-purple-200 leading-relaxed">{generatedSummary}</p>
              </div>
            )}

            {/* Collected Data Preview */}
            {formData && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-left">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {language === 'hi' ? 'एकत्रित डेटा:' : 'Collected Data:'}
                </h3>
                <div className="space-y-2 text-sm text-purple-200">
                  <p><strong>Name:</strong> {formData.fullName || 'Not provided'}</p>
                  <p><strong>Age:</strong> {calculateAge(formData.dateOfBirth) || 'Not provided'}</p>
                  <p><strong>Location:</strong> {formData.location || 'Not provided'}</p>
                  <p><strong>Education:</strong> {formData.degree || 'Not provided'}</p>
                  <p><strong>Profession:</strong> {formData.profession || 'Not provided'}</p>
                  <p><strong>Interview Responses:</strong> {Object.keys(formData.interviewResponses || {}).length} answers</p>
                  <p><strong>Family Type:</strong> {formData.familyType || 'Not provided'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-pink-500 hover:to-purple-500 transition-colors flex items-center gap-2"
              onClick={() => router.push('/profile')}
            >
              <User className="w-5 h-5" />
              {t.profileButton}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-purple-500 hover:to-blue-500 transition-colors flex items-center gap-2"
              onClick={() => router.push('/')}
            >
              <Home className="w-5 h-5" />
              {t.homeButton}
            </motion.button>
          </div>

          {/* Debug Information */}
          {formData && (
            <details className="mt-8 text-left">
              <summary className="text-purple-300 cursor-pointer hover:text-white">
                {language === 'hi' ? 'पूरा डेटा देखें (डेवलपर)' : 'View Full Data (Developer)'}
              </summary>
              <pre className="mt-4 p-4 bg-black/30 rounded-lg text-xs text-green-300 overflow-auto max-h-96">
                {JSON.stringify(formData, (key, value) => {
                  // Remove circular references and functions
                  if (typeof value === 'function') return '[Function]';
                  if (typeof value === 'object' && value !== null) {
                    if (value.constructor && value.constructor.name === 'Window') return '[Window Object]';
                    if (value.constructor && value.constructor.name === 'Document') return '[Document Object]';
                  }
                  return value;
                }, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default EndScreen; 