"use client";
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SpeakingAvatarProps {
  message: string;
  isSpeaking: boolean;
}

const SpeakingAvatar: React.FC<SpeakingAvatarProps> = ({ message, isSpeaking }) => {
  return (
    <div className="relative w-24 h-24">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center"
      >
        <div className="relative w-20 h-20">
          {/* Avatar face */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white/30 rounded-full" />
            </div>
          </div>
          
          {/* Speaking animation */}
          {isSpeaking && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
            >
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 4 }}
                    animate={{
                      height: [4, 12, 4],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-1 bg-white rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SpeakingAvatar; 