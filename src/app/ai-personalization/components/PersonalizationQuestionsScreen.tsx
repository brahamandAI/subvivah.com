"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { FaMicrophone, FaMicrophoneSlash, FaPaperPlane } from 'react-icons/fa';
import SpeakingAvatar from './SpeakingAvatar';

interface PersonalizationQuestionsScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

interface SuggestedAnswer {
  id: string;
  text: string;
  icon: string;
}

interface GeneratedQuestion {
  id: string;
  question: string;
  category: string;
  importance: string;
  suggestedAnswers: SuggestedAnswer[];
}

export default function PersonalizationQuestionsScreen({ onNext, onBack, initialData }: PersonalizationQuestionsScreenProps) {
  const { language, setLanguage } = useLanguage();
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isFetchingRef = useRef(false);

  const fetchQuestions = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialData),
      });
      if (!res.ok) {
        setError('Failed to generate personalized questions. Please try again.');
        setQuestions([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (error) {
      setError('Could not load personalized questions. Please try again later.');
      setQuestions([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [initialData]);

  useEffect(() => {
    // Initialize audio
    const audioElement = new Audio('/selection_beep.mp3');
    setAudio(audioElement);
    
    fetchQuestions();
  }, [fetchQuestions]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        // Simulate speech-to-text
        setIsProcessing(true);
        setTimeout(() => {
          setAnswer('This is a simulated transcription of your voice input.');
          setIsProcessing(false);
        }, 2000);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSuggestionSelect = (suggestion: SuggestedAnswer) => {
    setSelectedSuggestion(suggestion.id);
    
    // Play sound effect
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }

    if (suggestion.id === 'custom') {
      setShowCustomInput(true);
      setAnswer('');
    } else {
      setShowCustomInput(false);
      setAnswer(suggestion.text);
    }
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      const newAnswers = { ...answers, [questions[currentQuestion].id]: answer };
      setAnswers(newAnswers);
      setAnswer('');
      setSelectedSuggestion(null);
      setShowCustomInput(false);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        onNext(newAnswers);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mb-4"></div>
        <div className="text-white/80">Loading personalized questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="text-red-400 font-semibold mb-4">{error}</div>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="text-yellow-400 font-semibold mb-4">No questions available</div>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[70vh] relative"
    >
      {/* Language Switch Button */}
      <button
        className="absolute top-4 right-4 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold hover:bg-white/30 transition-colors z-10"
        onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
      >
        {language === 'hi' ? 'Change to English' : 'हिंदी में बदलें'}
      </button>

      <SpeakingAvatar text={currentQuestionData.question} size="lg" />

      <h1 className="text-4xl font-bold text-center mb-4 mt-8 text-white">
        {language === 'hi' ? 'व्यक्तिगत प्रश्न' : 'Personalized Questions'}
      </h1>
      <p className="text-xl text-purple-200 text-center mb-8 max-w-2xl">
        {language === 'hi' ? 'कृपया इन सवालों के जवाब दें ताकि हम आपकी प्रोफ़ाइल को और बेहतर बना सकें।' : 'Please answer these questions to help us personalize your profile.'}
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl w-full max-w-2xl">
        <div className="text-white/90 text-lg mb-4">
          {currentQuestionData.question}
        </div>

        {/* Suggested Answers */}
        <div className="space-y-4 mb-6">
          <h4 className="text-lg font-semibold text-white text-center">
            {language === 'hi' ? 'सुझाए गए जवाब चुनें:' : 'Choose a suggested answer:'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence>
              {currentQuestionData.suggestedAnswers.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`relative cursor-pointer rounded-xl p-3 transition-all duration-300 ${
                    selectedSuggestion === suggestion.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {/* Selection indicator */}
                  {selectedSuggestion === suggestion.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xl">{suggestion.icon}</span>
                    <span className="text-sm font-medium">{suggestion.text}</span>
                  </div>

                  {/* Blur effect for unselected cards */}
                  {selectedSuggestion && selectedSuggestion !== suggestion.id && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Custom Answer Input */}
        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="relative">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={language === 'hi' ? 'अपना जवाब लिखें...' : 'Write your own answer...'}
                className="w-full h-32 bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-white/50 focus:outline-none focus:border-pink-500/50 resize-none"
              />
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-pink-500 hover:bg-pink-600'} transition-colors`}
                  disabled={isProcessing}
                >
                  {isRecording ? (
                    <FaMicrophoneSlash className="text-white" />
                  ) : (
                    <FaMicrophone className="text-white" />
                  )}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || isProcessing}
                  className="p-2 rounded-full bg-purple-500 hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane className="text-white" />
                </button>
              </div>
            </div>
            
            {isProcessing && (
              <div className="text-center text-pink-400">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-pink-500 border-t-transparent mx-auto"></div>
                <span className="text-sm ml-2">Processing...</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Progress indicator */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
          <motion.div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            {language === 'hi' ? 'वापस' : 'Back'}
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (currentQuestion < questions.length - 1) {
                  setCurrentQuestion(currentQuestion + 1);
                  setAnswer('');
                  setSelectedSuggestion(null);
                  setShowCustomInput(false);
                }
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              {language === 'hi' ? 'अगला' : 'Next'}
            </button>

            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-500 hover:to-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === questions.length - 1 
                ? (language === 'hi' ? 'पूरा करें' : 'Complete') 
                : (language === 'hi' ? 'जमा करें' : 'Submit')
              }
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 