"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { FaMicrophone, FaMicrophoneSlash, FaPaperPlane, FaVolumeUp } from 'react-icons/fa';
import SpeakingAvatar from './SpeakingAvatar';

interface PersonalizedInterviewProps {
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

const PersonalizedInterview: React.FC<PersonalizedInterviewProps> = ({
  onNext,
  onBack,
  initialData,
}) => {
  const { language } = useLanguage();
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
        body: JSON.stringify({
          ...initialData,
          language
        }),
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
  }, [initialData, language]);

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

  const TEXT = {
    hi: {
      title: 'व्यक्तिगत साक्षात्कार',
      subtitle: 'कृपया इन सवालों के जवाब दें',
      questionCount: 'प्रश्न',
      of: 'का',
      back: 'वापस',
      next: 'अगला',
      complete: 'पूरा करें',
      loading: 'प्रश्न लोड हो रहे हैं...',
      error: 'प्रश्न लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
      placeholder: 'अपना उत्तर यहाँ लिखें...',
      recording: 'रिकॉर्डिंग रोकें',
      startRecording: 'रिकॉर्डिंग शुरू करें',
      submit: 'उत्तर भेजें',
      chooseAnswer: 'सुझाए गए जवाब चुनें:',
      writeYourOwn: 'अपना जवाब लिखें...'
    },
    en: {
      title: 'Personalized Interview',
      subtitle: 'Please answer these questions',
      questionCount: 'Question',
      of: 'of',
      back: 'Back',
      next: 'Next',
      complete: 'Complete',
      loading: 'Loading questions...',
      error: 'Error loading questions. Please try again.',
      placeholder: 'Type your answer here...',
      recording: 'Stop Recording',
      startRecording: 'Start Recording',
      submit: 'Submit Answer',
      chooseAnswer: 'Choose a suggested answer:',
      writeYourOwn: 'Write your own answer...'
    }
  };

  const t = TEXT[language];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center min-h-[70vh]"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mb-4"></div>
        <div className="text-white/80">{t.loading}</div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center min-h-[70vh]"
      >
        <div className="text-red-400 font-semibold mb-4">{t.error}</div>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          {t.back}
        </button>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center min-h-[70vh]"
      >
        <div className="text-yellow-400 font-semibold mb-4">No questions available</div>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          {t.back}
        </button>
      </motion.div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto p-4"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
        <SpeakingAvatar 
          text={currentQuestionData.question} 
          size="md" 
        />

        <div className="mt-6 space-y-6">
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white/90 mb-2">
              {t.questionCount} {currentQuestion + 1} {t.of} {questions.length}
            </h3>
            <p className="text-white/80 text-sm">
              {currentQuestionData.question}
            </p>
          </div>

          {/* Suggested Answers */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white text-center">
              {t.chooseAnswer}
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
                  placeholder={t.writeYourOwn}
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/50 focus:outline-none focus:border-pink-500 transition-colors resize-none pr-20"
                />
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-full ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-pink-500 hover:bg-pink-600'
                    } transition-colors shadow-lg`}
                    title={isRecording ? t.recording : t.startRecording}
                    disabled={isProcessing}
                  >
                    {isRecording ? (
                      <FaMicrophoneSlash className="w-6 h-6 text-white" />
                    ) : (
                      <FaMicrophone className="w-6 h-6 text-white" />
                    )}
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
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              {t.back}
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
                {t.next}
              </button>

              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-500 hover:to-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestion === questions.length - 1 ? t.complete : t.submit}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalizedInterview; 