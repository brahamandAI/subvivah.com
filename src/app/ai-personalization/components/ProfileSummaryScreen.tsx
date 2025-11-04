'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import SpeakingAvatar from './SpeakingAvatar';

interface ProfileSummaryScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: {
    shardAnswers: Record<string, string>;
    personalizedAnswers: Record<string, string>;
  };
}

interface ProfileSummary {
  summary: string;
  keyTraits: string[];
  compatibilityNotes: string;
  matchPreferences: string;
}

export default function ProfileSummaryScreen({ onNext, onBack, initialData }: ProfileSummaryScreenProps) {
  const { language } = useLanguage();
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarText, setAvatarText] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const isGeneratingRef = useRef(false);
  const hasGeneratedRef = useRef(false);

  const generateSummary = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isGeneratingRef.current || hasGeneratedRef.current) {
      return;
    }
    
    isGeneratingRef.current = true;
    setGenerating(true);
    setError(null);
    
    try {
      console.log('Generating summary with data:', initialData);
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shardAnswers: initialData.shardAnswers,
          personalizedAnswers: initialData.personalizedAnswers,
          language
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      console.log('Generated summary:', data);
      setSummary(data);
      setAvatarText('I have generated a summary based on your answers. Please review it and make sure it represents you accurately.');
      hasGeneratedRef.current = true;
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Failed to generate summary. Please try again.');
      setAvatarText('I apologize, but I encountered an error while generating your summary. Would you like to try again?');
      hasGeneratedRef.current = false; // Allow retry on error
    } finally {
      setGenerating(false);
      setLoading(false);
      isGeneratingRef.current = false;
    }
  }, [initialData.shardAnswers, initialData.personalizedAnswers, language]);

  useEffect(() => {
    generateSummary();
  }, [generateSummary]);

  const verifyData = async () => {
    try {
      const verifyResponse = await fetch('/api/ai/verify-personalization', {
        credentials: 'include'
      });
      
      if (!verifyResponse.ok) {
        throw new Error('Failed to verify data');
      }

      const verifyResult = await verifyResponse.json();
      console.log('✅ Verification result:', verifyResult);
      setVerificationStatus(verifyResult.verification);

      if (!verifyResult.verification.exists || !verifyResult.verification.isComplete) {
        throw new Error('Data not saved completely');
      }

      return true;
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return false;
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      console.log('📝 Saving personalization data:', {
        shardAnswers: initialData.shardAnswers,
        personalizedAnswers: initialData.personalizedAnswers,
        profileSummary: summary,
        isCompleted: true
      });

      // Save all data to database
      const saveResponse = await fetch('/api/ai/save-personalization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shardAnswers: initialData.shardAnswers,
          personalizedAnswers: initialData.personalizedAnswers,
          profileSummary: summary,
          isCompleted: true
        }),
        credentials: 'include'
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save personalization data');
      }

      const saveData = await saveResponse.json();
      console.log('✅ Save successful:', saveData);

      // Verify the saved data
      const isVerified = await verifyData();
      
      if (!isVerified) {
        throw new Error('Data verification failed');
      }

      setSaveSuccess(true);
      setAvatarText('Great! Your AI personalization has been completed successfully. You can now view your personalized matches.');
      
      // Show success message for 2 seconds before redirecting to personalized matches
      setTimeout(() => {
        window.location.href = '/personalized-matches';
      }, 2000);

    } catch (error) {
      console.error('❌ Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save your profile. Please try again.');
      setAvatarText('I apologize, but there was an error saving your profile. Would you like to try again?');
      setSaveSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  const TEXT = {
    hi: {
      title: 'आपकी प्रोफ़ाइल सारांश',
      subtitle: 'आपकी पसंद और जवाबों के आधार पर तैयार किया गया',
      generating: 'आपकी प्रोफ़ाइल तैयार कर रहे हैं...',
      keyTraits: 'मुख्य विशेषताएं',
      compatibilityNotes: 'संगतता नोट्स',
      matchPreferences: 'मैच प्राथमिकताएं',
      complete: 'पूरा करें',
      back: 'वापस',
      error: 'प्रोफ़ाइल सारांश तैयार करने में समस्या हुई। कृपया फिर से कोशिश करें।',
      success: 'बधाई हो! आपका AI व्यक्तित्व विश्लेषण पूरा हो गया है।',
      redirecting: 'आपको व्यक्तिगत मैचेस पेज पर भेजा जा रहा है...'
    },
    en: {
      title: 'Your Profile Summary',
      subtitle: 'Generated based on your preferences and answers',
      generating: 'Preparing your profile...',
      keyTraits: 'Key Traits',
      compatibilityNotes: 'Compatibility Notes',
      matchPreferences: 'Match Preferences',
      complete: 'Complete',
      back: 'Back',
      error: 'Failed to generate profile summary. Please try again.',
      success: 'Congratulations! Your AI personalization has been completed.',
      redirecting: 'Redirecting you to personalized matches...'
    }
  };

  const t = TEXT[language];

  if (loading || generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="mt-4 text-gray-600">
          {generating ? 'Generating your profile summary...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button
          onClick={() => {
            setError(null);
            hasGeneratedRef.current = false; // Reset to allow retry
            generateSummary();
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 relative">
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex flex-col items-center"
        >
          <div className="text-lg font-semibold mb-1">{t.success}</div>
          <div className="text-sm opacity-90">{t.redirecting}</div>
        </motion.div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
        {language === 'hi' ? 'आपका प्रोफ़ाइल सारांश' : 'Your Profile Summary'}
      </h2>
        <p className="text-purple-200 text-lg">
          {language === 'hi' ? 'आपकी पसंद और जवाबों के आधार पर तैयार किया गया' : 'Generated based on your preferences and answers'}
        </p>
      </div>

      {summary && (
        <div className="space-y-6">
          <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-lg shadow border border-purple-500/20">
            <h3 className="text-xl font-semibold mb-4 text-purple-100">
              {language === 'hi' ? 'सारांश' : 'Summary'}
            </h3>
            <p className="text-purple-200">{summary.summary}</p>
          </div>

          <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-lg shadow border border-purple-500/20">
            <h3 className="text-xl font-semibold mb-4 text-purple-100">
              {language === 'hi' ? 'प्रमुख विशेषताएं' : 'Key Traits'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {summary.keyTraits.map((trait, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-800/50 text-purple-200 rounded-full text-sm"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-lg shadow border border-purple-500/20">
            <h3 className="text-xl font-semibold mb-4 text-purple-100">
              {language === 'hi' ? 'संगतता नोट्स' : 'Compatibility Notes'}
            </h3>
            <p className="text-purple-200">{summary.compatibilityNotes}</p>
          </div>

          <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-lg shadow border border-purple-500/20">
            <h3 className="text-xl font-semibold mb-4 text-purple-100">
              {language === 'hi' ? 'मैच प्राथमिकताएं' : 'Match Preferences'}
            </h3>
            <p className="text-purple-200">{summary.matchPreferences}</p>
          </div>
        </div>
      )}

      {verificationStatus && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-purple-900/30 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-500/20 mt-8"
        >
          <h3 className="text-xl font-semibold text-purple-100 mb-4">Verification Status</h3>
          <ul className="space-y-3">
            {[
              { label: 'Data Exists', status: verificationStatus.exists },
              { label: 'Completion Status', status: verificationStatus.isComplete },
              { label: 'Shard Answers', status: verificationStatus.hasShardAnswers },
              { label: 'Personalized Answers', status: verificationStatus.hasPersonalizedAnswers },
              { label: 'Profile Summary', status: verificationStatus.hasProfileSummary }
            ].map((item, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="flex items-center text-base bg-purple-900/20 p-3 rounded-lg"
              >
                <span className={`flex items-center ${item.status ? "text-green-400" : "text-red-400"}`}>
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-900/30 mr-3">
                    {item.status ? "✓" : "✗"}
              </span>
                  <span className="text-purple-100">{item.label}</span>
              </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-between mt-12 pt-6 border-t border-purple-500/20"
      >
        <button
          onClick={onBack}
          className="px-8 py-3 bg-purple-900/50 text-purple-100 rounded-xl hover:bg-purple-900/70 transition-all border border-purple-500/20 hover:border-purple-500/40 backdrop-blur-sm"
          disabled={saving}
        >
          {language === 'hi' ? 'पीछे' : 'Back'}
        </button>

        <button
          onClick={handleComplete}
          disabled={saving || !summary}
          className={`px-8 py-3 rounded-xl transition-all relative backdrop-blur-sm ${
            saving
              ? 'bg-purple-900/30 cursor-not-allowed'
              : saveSuccess
              ? 'bg-green-500/80 hover:bg-green-500/90'
              : 'bg-purple-600/80 hover:bg-purple-600/90'
          } text-white border border-purple-500/20 hover:border-purple-500/40`}
        >
          {saving ? (
            <span className="flex items-center">
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></span>
              {language === 'hi' ? 'सहेज रहा है...' : 'Saving...'}
            </span>
          ) : saveSuccess ? (
            <span className="flex items-center">
              <span className="mr-2">✓</span>
              {language === 'hi' ? 'सफलतापूर्वक सहेजा गया' : 'Saved Successfully'}
            </span>
          ) : (
            language === 'hi' ? 'पूर्ण करें' : 'Complete'
          )}
        </button>
      </motion.div>
    </div>
  );
} 