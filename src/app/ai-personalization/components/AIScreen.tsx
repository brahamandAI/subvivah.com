'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import SpeakingAvatar, { SpeakingAvatarHandle } from './SpeakingAvatar';
import { useLanguage } from '@/context/LanguageContext';

interface AIScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  userData: any;
}

export default function AIScreen({ onNext, onBack, userData }: AIScreenProps) {
  const { language } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const avatarRef = useRef<SpeakingAvatarHandle>(null);
  const isGeneratingRef = useRef(false);

  const generateQuestions = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isGeneratingRef.current) {
      return;
    }
    
    isGeneratingRef.current = true;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData, language }),
      });

      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsLoading(false);
      isGeneratingRef.current = false;
    }
  }, [userData, language]);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  // Stop any ongoing speech when moving to next question
  const stopSpeaking = () => {
    avatarRef.current?.stopSpeaking();
  };

  const handleAnswer = (answer: string) => {
    stopSpeaking();
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setCurrentAnswer(''); // Clear the current answer for the next question
    } else {
      onNext({ aiAnswers: newAnswers });
    }
  };

  // Speech-to-text logic
  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCurrentAnswer(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-purple-200 text-sm sm:text-base">Generating personalized questions...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto px-4 sm:px-6"
    >
      <div className="flex flex-col items-center">
        <SpeakingAvatar
          ref={avatarRef}
          text={questions[currentQuestion]}
          size="md"
          showStopButton={true}
          onStopSpeaking={stopSpeaking}
        />

        <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 mt-6 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
            Question {currentQuestion + 1} of {questions.length}
          </h3>
          <p className="text-base sm:text-lg text-purple-200 mb-4 sm:mb-6 flex items-center gap-2">
            {questions[currentQuestion]}
            <span title="You can speak your answer">
              <svg className="inline w-5 h-5 sm:w-6 sm:h-6 text-purple-400 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v2m0 0c-3.314 0-6-2.686-6-6h2a4 4 0 008 0h2c0 3.314-2.686 6-6 6zm0 0V4m0 0a4 4 0 00-4 4v4a4 4 0 008 0V8a4 4 0 00-4-4z" />
              </svg>
            </span>
          </p>

          <div className="flex items-center gap-2">
            <textarea
              className="w-full h-24 sm:h-32 px-3 sm:px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-purple-300 text-sm sm:text-base"

              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
            />
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-2 rounded-full border-2 ${isListening ? 'border-purple-600 bg-purple-600/20' : 'border-purple-500/30 bg-white/10'} focus:outline-none touch-manipulation`}
              title={isListening ? 'Listening...' : 'Speak your answer'}
            >
              <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isListening ? 'text-purple-400 animate-pulse' : 'text-purple-300'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v2m0 0c-3.314 0-6-2.686-6-6h2a4 4 0 008 0h2c0 3.314-2.686 6-6 6zm0 0V4m0 0a4 4 0 00-4 4v4a4 4 0 008 0V8a4 4 0 00-4-4z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex justify-between w-full">
          <motion.button
            onClick={() => {
              stopSpeaking();
              onBack();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-white/10 text-purple-200 rounded-lg font-semibold hover:bg-white/20 transition-colors text-sm sm:text-base touch-manipulation"
          >
            Back
          </motion.button>

          <motion.button
            onClick={() => handleAnswer(currentAnswer)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-500 hover:to-purple-500 transition-colors text-sm sm:text-base touch-manipulation"
            disabled={!currentAnswer}
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Continue'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 