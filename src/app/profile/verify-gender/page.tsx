"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';

// Dynamically import FaceVerification with no SSR and loading state
const FaceVerification = dynamic(() => import('@/components/FaceVerification'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      <span className="ml-3 text-white">Loading verification...</span>
    </div>
  )
});

const GenderVerificationPage = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'completed' | 'failed'>('pending');

  const handleVerificationComplete = async (data: any) => {
    try {
      // Update user's gender based on verification result
      const response = await fetch('/api/auth/update-gender', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gender: data.gender,
          isVerified: true
        }),
      });

      if (response.ok) {
        setVerificationStatus('completed');
        // Redirect back to profile after a short delay
        setTimeout(() => {
          router.push('/profile?message=gender_verified');
        }, 2000);
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error('Error updating gender:', error);
      setVerificationStatus('failed');
    }
  };

  const TEXT = {
    hi: {
      title: 'लिंग सत्यापन',
      subtitle: 'अपनी पहचान सत्यापित करें',
      description: 'अपनी प्रोफ़ाइल की विश्वसनीयता बढ़ाने के लिए अपना लिंग सत्यापित करें। यह प्रक्रिया आपकी तस्वीर का विश्लेषण करके आपका लिंग निर्धारित करेगी।',
      startVerification: 'सत्यापन शुरू करें',
      back: 'वापस',
      status: {
        pending: 'सत्यापन की प्रतीक्षा में',
        completed: 'सत्यापन पूरा हुआ',
        failed: 'सत्यापन विफल'
      }
    },
    en: {
      title: 'Gender Verification',
      subtitle: 'Verify your identity',
      description: 'Verify your gender to increase your profile credibility. This process will analyze your photo to determine your gender.',
      startVerification: 'Start Verification',
      back: 'Back',
      status: {
        pending: 'Awaiting verification',
        completed: 'Verification completed',
        failed: 'Verification failed'
      }
    }
  };

  const t = TEXT[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white">{t.title}</h1>
              <p className="text-purple-200">{t.subtitle}</p>
            </div>
          </div>

          {!showFaceVerification ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
            >
              {/* Verification Info */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  {t.title}
                </h2>
                <p className="text-purple-200 max-w-2xl mx-auto leading-relaxed">
                  {t.description}
                </p>
              </div>

              {/* Verification Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {language === 'hi' ? 'फोटो अपलोड करें' : 'Upload Photo'}
                  </h3>
                  <p className="text-sm text-purple-200">
                    {language === 'hi' 
                      ? 'अपनी स्पष्ट तस्वीर अपलोड करें'
                      : 'Upload a clear photo of yourself'
                    }
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {language === 'hi' ? 'AI विश्लेषण' : 'AI Analysis'}
                  </h3>
                  <p className="text-sm text-purple-200">
                    {language === 'hi'
                      ? 'AI आपकी तस्वीर का विश्लेषण करेगा'
                      : 'AI will analyze your photo'
                    }
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {language === 'hi' ? 'सत्यापन पूरा' : 'Verification Complete'}
                  </h3>
                  <p className="text-sm text-purple-200">
                    {language === 'hi'
                      ? 'आपका लिंग सत्यापित हो जाएगा'
                      : 'Your gender will be verified'
                    }
                  </p>
                </div>
              </div>

              {/* Start Verification Button */}
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFaceVerification(true)}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-colors flex items-center gap-3 mx-auto"
                >
                  <Camera className="w-5 h-5" />
                  {t.startVerification}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <React.Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <span className="ml-3 text-white">Loading verification...</span>
              </div>
            }>
              <FaceVerification
                onVerificationComplete={handleVerificationComplete}
                onClose={() => setShowFaceVerification(false)}
              />
            </React.Suspense>
          )}

          {/* Status Messages */}
          {verificationStatus === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-green-500/20 border border-green-400/30 rounded-lg p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-green-400">
                <span className="text-2xl">✅</span>
                <span className="font-semibold">{t.status.completed}</span>
              </div>
              <p className="text-green-300 text-sm mt-2">
                {language === 'hi' 
                  ? 'आपका लिंग सफलतापूर्वक सत्यापित हो गया है। आपको प्रोफ़ाइल पेज पर पुनर्निर्देशित किया जा रहा है...'
                  : 'Your gender has been successfully verified. Redirecting to profile page...'
                }
              </p>
            </motion.div>
          )}

          {verificationStatus === 'failed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-500/20 border border-red-400/30 rounded-lg p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-red-400">
                <span className="text-2xl">❌</span>
                <span className="font-semibold">{t.status.failed}</span>
              </div>
              <p className="text-red-300 text-sm mt-2">
                {language === 'hi'
                  ? 'सत्यापन विफल हुआ। कृपया पुनः प्रयास करें।'
                  : 'Verification failed. Please try again.'
                }
              </p>
              <button
                onClick={() => setVerificationStatus('pending')}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                {language === 'hi' ? 'पुनः प्रयास करें' : 'Try Again'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GenderVerificationPage; 