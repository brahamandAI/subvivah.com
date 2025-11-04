'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SwipeCardsScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  aiAnswers: string[];
}

interface Card {
  id: number;
  left: string;
  right: string;
  leftEmoji: string;
  rightEmoji: string;
}

export default function SwipeCardsScreen({ onNext, onBack, aiAnswers }: SwipeCardsScreenProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<Record<number, 'left' | 'right'>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateCards();
  }, []);

  const generateCards = async () => {
    try {
      const response = await fetch('/api/ai/generate-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aiAnswers }),
      });

      const data = await response.json();
      setCards(data.cards);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating cards:', error);
      setIsLoading(false);
    }
  };

  const handleChoice = (choice: 'left' | 'right') => {
    setSelectedChoices(prev => ({
      ...prev,
      [currentCard]: choice
    }));

    if (currentCard < cards.length - 1) {
      setCurrentCard(prev => prev + 1);
    } else {
      onNext({ preferences: selectedChoices });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-white-200 text-sm sm:text-base">Generating your preferences...</p>
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
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8 text-white">
          Quick Choices
        </h2>
        
        <p className="text-base sm:text-lg text-purple-200 text-center mb-6 sm:mb-8 px-2">
          Based on what you told us, which do you prefer?
        </p>

        <div className="relative w-full h-[300px] sm:h-[400px] mb-6 sm:mb-8">
          <AnimatePresence>
            {cards[currentCard] && (
              <motion.div
                key={currentCard}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0"
              >
                <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChoice('left')}
                    className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-300 border border-purple-500/30 touch-manipulation"
                  >
                    <motion.span 
                      className="text-5xl sm:text-6xl mb-4 sm:mb-6"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      {cards[currentCard].leftEmoji}
                    </motion.span>
                    <span className="text-lg sm:text-xl font-semibold text-center text-purple-200 px-1">
                      {cards[currentCard].left}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChoice('right')}
                    className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center hover:bg-white/20 transition-all duration-300 border border-purple-500/30 touch-manipulation"
                  >
                    <motion.span 
                      className="text-5xl sm:text-6xl mb-4 sm:mb-6"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      {cards[currentCard].rightEmoji}
                    </motion.span>
                    <span className="text-lg sm:text-xl font-semibold text-center text-purple-200 px-1">
                      {cards[currentCard].right}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between w-full items-center">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-white/10 text-purple-200 rounded-lg font-semibold hover:bg-white/20 transition-colors text-sm sm:text-base touch-manipulation"
          >
            Back
          </motion.button>

          <div className="text-purple-200 text-sm sm:text-base">
            {currentCard + 1} of {cards.length}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 