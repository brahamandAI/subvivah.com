'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { FaMicrophone, FaMicrophoneSlash, FaPaperPlane, FaVolumeUp } from 'react-icons/fa';
import SpeakingAvatar from './SpeakingAvatar';

interface PersonalizedQuestionsScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: {
    shardAnswers: Record<string, string>;
  };
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

export default function PersonalizedQuestionsScreen({ onNext, onBack, initialData }: PersonalizedQuestionsScreenProps) {
  const { language } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [currentWordIdx, setCurrentWordIdx] = useState(-1);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const questionWords = questions[currentQuestionIndex]?.question.split(/\s+/);
  const isGeneratingRef = useRef(false);
  const hasGeneratedRef = useRef(false);

  const generateQuestions = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isGeneratingRef.current || hasGeneratedRef.current) {
      return;
    }
    
    isGeneratingRef.current = true;
    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shardAnswers: initialData.shardAnswers,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
      setLoading(false);
      hasGeneratedRef.current = true;
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Failed to generate personalized questions. Please try again.');
      setLoading(false);
      hasGeneratedRef.current = false; // Allow retry on error
    } finally {
      setGenerating(false);
      isGeneratingRef.current = false;
    }
  }, [initialData.shardAnswers, language]);

  useEffect(() => {
    // Initialize audio
    const audioElement = new Audio('/selection_beep.mp3');
    setAudio(audioElement);
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentAnswer(transcript);
        setIsRecording(false);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }
    
    // Reset flags when language changes
    if (hasGeneratedRef.current) {
      hasGeneratedRef.current = false;
    }
    
    generateQuestions();
  }, [generateQuestions]);

  const handleVoiceInput = () => {
    if (recognition && !isRecording) {
      setIsRecording(true);
      recognition.start();
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
      setCurrentAnswer('');
    } else {
      setShowCustomInput(false);
      setCurrentAnswer(suggestion.text);
    }
  };

  const handleSubmitAnswer = () => {
    if (currentAnswer.trim()) {
      const newAnswers = { ...answers, [questions[currentQuestionIndex].id]: currentAnswer };
      setAnswers(newAnswers);
      setCurrentAnswer('');
      setSelectedSuggestion(null);
      setShowCustomInput(false);
      
      // Play sound effect
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // All questions completed
        onNext({ 
          personalizedAnswers: newAnswers,
          shardAnswers: initialData.shardAnswers 
        });
      }
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      setSelectedSuggestion(null);
      setShowCustomInput(false);
    } else {
      onNext({ 
        personalizedAnswers: answers,
        shardAnswers: initialData.shardAnswers 
      });
    }
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const TEXT = {
    hi: {
      title: 'व्यक्तिगत प्रश्न',
      subtitle: 'आपकी पसंद के आधार पर तैयार किए गए विशेष प्रश्न',
      generating: 'आपके लिए प्रश्न तैयार कर रहे हैं...',
      recording: 'बोल रहे हैं...',
      startRecording: 'बोलने के लिए क्लिक करें',
      stopRecording: 'रोकने के लिए क्लिक करें',
      submit: 'जवाब भेजें',
      skip: 'छोड़ें',
      back: 'वापस',
      question: 'प्रश्न',
      of: 'का',
      error: 'प्रश्न तैयार करने में समस्या हुई। कृपया फिर से कोशिश करें।',
      orWriteYourOwn: 'या अपना जवाब लिखें',
      writeYourOwn: 'अपना जवाब लिखें...'
    },
    en: {
      title: 'Personalized Questions',
      subtitle: 'Special questions prepared based on your preferences',
      generating: 'Generating questions for you...',
      recording: 'Recording...',
      startRecording: 'Click to speak',
      stopRecording: 'Click to stop',
      submit: 'Submit Answer',
      skip: 'Skip',
      back: 'Back',
      question: 'Question',
      of: 'of',
      error: 'Failed to generate questions. Please try again.',
      orWriteYourOwn: 'or write your own answer',
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
        className="w-full max-w-4xl mx-auto p-4"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-200">{t.generating}</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-4xl mx-auto p-4"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-4">{t.error}</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-semibold hover:from-pink-500 hover:to-purple-500 transition-colors"
          >
            {t.back}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-4xl mx-auto p-4"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center">
          <div className="text-yellow-400 text-6xl mb-4">🤔</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Questions Generated</h2>
          <p className="text-purple-200 mb-6">Unable to generate personalized questions at this time.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-semibold hover:from-pink-500 hover:to-purple-500 transition-colors"
          >
            {t.back}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto p-4"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-sm">
              {t.question} {currentQuestionIndex + 1} {t.of} {questions.length}
            </span>
            <span className="text-white/80 text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <SpeakingAvatar 
            text={currentQuestion.question} 
            size="lg" 
            onWordBoundary={setCurrentWordIdx}
          />
          {/* YouTube-style subtitle */}
          <div className="flex flex-wrap justify-center items-center gap-2 mt-6 mb-4">
            {questionWords.map((word, idx) => (
              <span
                key={idx}
                className={
                  currentWordIdx === idx
                    ? 'text-3xl font-extrabold text-pink-400 transition-all duration-150 scale-110'
                    : currentWordIdx > idx
                      ? 'text-2xl font-semibold text-white/90 transition-all duration-150'
                      : 'text-2xl font-semibold text-purple-200 transition-all duration-150'
                }
                style={{ marginRight: 6 }}
              >
                {word}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-sm text-purple-300">
              {currentQuestion.category} • {currentQuestion.importance} importance
            </span>
          </div>
        </div>

        {/* Suggested Answers */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            {language === 'hi' ? 'सुझाए गए जवाब चुनें:' : 'Choose a suggested answer:'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <AnimatePresence>
              {currentQuestion.suggestedAnswers.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`relative cursor-pointer rounded-xl p-4 transition-all duration-300 ${
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
                      className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-sm">✓</span>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{suggestion.icon}</span>
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
            className="mb-8"
          >
            <div className="relative">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={t.writeYourOwn}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none"
                rows={4}
              />
              
              {/* Voice Input Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVoiceInput}
                disabled={isRecording}
                className={`absolute bottom-3 right-3 p-3 rounded-full transition-colors ${
                  isRecording
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </motion.button>
            </div>
            
            {isRecording && (
              <div className="mt-2 text-center">
                <div className="flex items-center justify-center gap-2 text-pink-400">
                  <FaVolumeUp className="animate-pulse" />
                  <span className="text-sm">{t.recording}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="px-6 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors"
          >
            {t.back}
          </motion.button>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSkip}
              className="px-6 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors"
            >
              {t.skip}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim()}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-semibold hover:from-pink-500 hover:to-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.submit}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 