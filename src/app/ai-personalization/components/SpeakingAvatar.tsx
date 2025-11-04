'use client';

import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

interface SpeakingAvatarProps {
  text: string;
  onSpeakEnd?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showStopButton?: boolean;
  onStopSpeaking?: () => void;
  onWordBoundary?: (wordIndex: number) => void;
}

export interface SpeakingAvatarHandle {
  stopSpeaking: () => void;
}

const sizeMap = {
  sm: 160,
  md: 220,
  lg: 320,
};

const SpeakingAvatar = forwardRef<SpeakingAvatarHandle, SpeakingAvatarProps>(
  ({ text, onSpeakEnd, size = 'md', showStopButton = false, onStopSpeaking, onWordBoundary }, ref) => {
    const { language } = useLanguage();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [femaleVoice, setFemaleVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [voiceError, setVoiceError] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isStoppedRef = useRef(false);
    const [isMounted, setIsMounted] = useState(false);
    const [voiceReady, setVoiceReady] = useState(false);
    const retryCountRef = useRef(0);
    const maxRetries = 3;
    const voiceLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isPermissionGranted, setIsPermissionGranted] = useState(true);

    // Check if speech synthesis is available and allowed
    const checkSpeechSynthesisAvailability = () => {
      if (!window.speechSynthesis) {
        setVoiceError(true);
        return false;
      }

      // Some browsers require user interaction before allowing speech synthesis
      try {
        const testUtterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(testUtterance);
        window.speechSynthesis.cancel();
        return true;
      } catch (error) {
        // Silently handle permission issues
        setIsPermissionGranted(false);
        return false;
      }
    };

    useEffect(() => {
      setIsMounted(true);
      checkSpeechSynthesisAvailability();
      return () => {
        if (voiceLoadTimeoutRef.current) {
          clearTimeout(voiceLoadTimeoutRef.current);
        }
        window.speechSynthesis.cancel();
      };
    }, []);

    // Enhanced voice loading with retries and better error handling
    useEffect(() => {
      if (!isMounted || !isPermissionGranted) return;

      function loadVoices() {
        if (!checkSpeechSynthesisAvailability()) return;

        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;

        try {
          if (language === 'hi') {
            selectedVoice = voices.find(
              v => v.lang.toLowerCase().includes('hi') && (
                v.name.toLowerCase().includes('female') ||
                v.name.toLowerCase().includes('woman') ||
                v.name.toLowerCase().includes('girl') ||
                v.name.toLowerCase().includes('zira') ||
                v.name.toLowerCase().includes('susan') ||
                v.name.toLowerCase().includes('samantha')
              )
            ) || voices.find(v => v.lang.toLowerCase().includes('hi'));
          } else {
            selectedVoice = voices.find(
              v => v.lang.toLowerCase().includes('en') && (
                v.name.toLowerCase().includes('female') ||
                v.name.toLowerCase().includes('woman') ||
                v.name.toLowerCase().includes('girl') ||
                v.name.toLowerCase().includes('zira') ||
                v.name.toLowerCase().includes('susan') ||
                v.name.toLowerCase().includes('samantha')
              )
            ) || voices.find(v => v.lang.toLowerCase().includes('en'));
          }

          if (selectedVoice) {
            setFemaleVoice(selectedVoice);
            setVoiceError(false);
            setVoiceReady(true);
            retryCountRef.current = 0;
          } else {
            throw new Error('No suitable voice found');
          }
        } catch (error) {
          console.error('Voice loading error:', error);
          setVoiceError(true);
          setVoiceReady(false);
          
          // Retry logic
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            voiceLoadTimeoutRef.current = setTimeout(loadVoices, 1000 * retryCountRef.current);
          }
        }
      }

      // Initial voice loading
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
        window.speechSynthesis.onvoiceschanged = loadVoices;
        voiceLoadTimeoutRef.current = setTimeout(loadVoices, 100);
      } else {
        loadVoices();
      }

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        window.speechSynthesis.onvoiceschanged = null;
        if (voiceLoadTimeoutRef.current) {
          clearTimeout(voiceLoadTimeoutRef.current);
        }
      };
    }, [isMounted, language, isPermissionGranted]);

    // Auto-speak when text changes with better error handling
    useEffect(() => {
      if (!isMounted || !text || !femaleVoice || !voiceReady) return;
      
      isStoppedRef.current = false;
      window.speechSynthesis.cancel();

      try {
        const speech = new window.SpeechSynthesisUtterance(text);
        speech.rate = 0.95;
        speech.pitch = 1.1;
        speech.voice = femaleVoice;
        utteranceRef.current = speech;

        // Word boundary tracking
        if (typeof speech.onboundary !== 'undefined' && typeof text === 'string' && typeof onWordBoundary === 'function') {
          const words = text.split(/\s+/);
          speech.onboundary = (event: any) => {
            if (event.name === 'word' && event.charIndex !== undefined) {
              // Find the word index by charIndex
              let charCount = 0;
              let wordIdx = 0;
              for (let i = 0; i < words.length; i++) {
                charCount += words[i].length + 1; // +1 for space
                if (event.charIndex < charCount) {
                  wordIdx = i;
                  break;
                }
              }
              onWordBoundary(wordIdx);
            }
          };
        }

        // Add error handling for speech synthesis
        speech.onerror = (event) => {
          // Silently handle not-allowed errors to prevent console spam
          if (event.error === 'not-allowed') {
            setIsPermissionGranted(false);
            setVoiceError(false); // Don't show error for permission issues
          } else {
            console.error('Speech synthesis error:', event);
            setVoiceError(true);
          }
          setIsSpeaking(false);
          onSpeakEnd?.();
        };

        speech.onstart = () => {
          setIsSpeaking(true);
          setVoiceError(false);
          setIsPermissionGranted(true);
        };

        speech.onend = () => {
          if (isStoppedRef.current) return;
          setIsSpeaking(false);
          onSpeakEnd?.();
          if (typeof onWordBoundary === 'function') {
            onWordBoundary(-1); // Reset word highlight
          }
        };

        // Ensure speech synthesis is in a good state
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        // Try to speak, but handle failures gracefully
        setTimeout(() => {
          if (!isStoppedRef.current) {
            try {
              window.speechSynthesis.speak(speech);
            } catch (error) {
              // Silently fail if speech is not allowed
              setIsSpeaking(false);
            }
          }
        }, 100);
      } catch (error) {
        // Silently handle initialization errors
        setIsSpeaking(false);
        onSpeakEnd?.();
      }

      return () => {
        if (utteranceRef.current) {
          utteranceRef.current.onend = null;
          utteranceRef.current.onerror = null;
          utteranceRef.current.onstart = null;
        }
        window.speechSynthesis.cancel();
      };
    }, [text, femaleVoice, isMounted, voiceReady, onSpeakEnd, onWordBoundary]);

    // Expose enhanced stopSpeaking method
    useImperativeHandle(ref, () => ({
      stopSpeaking: () => {
        if (isStoppedRef.current) return;
        isStoppedRef.current = true;
        if (utteranceRef.current) {
          utteranceRef.current.onend = null;
          utteranceRef.current.onerror = null;
          utteranceRef.current.onstart = null;
        }
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        onStopSpeaking?.();
      },
    }));

    const svgSize = sizeMap[size];

    if (!isMounted) {
      return (
        <div className="flex flex-col items-center justify-center relative">
          <div style={{ width: svgSize, height: svgSize }} className="bg-white/10 rounded-full animate-pulse" />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center relative">
        <div style={{ width: svgSize, height: svgSize }} className="relative">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{ 
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
              background: 'transparent'
            }}
          >
            <defs>
              <linearGradient id="faceShading" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FFF6ED', stopOpacity: 0.7 }} />
                <stop offset="50%" style={{ stopColor: '#F9E3D3', stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: '#F5D6B8', stopOpacity: 0.3 }} />
              </linearGradient>
              <linearGradient id="hairShading" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#2C1810', stopOpacity: 0.95 }} />
                <stop offset="100%" style={{ stopColor: '#1A0F0A', stopOpacity: 0.85 }} />
              </linearGradient>
              <linearGradient id="sareeBlouse" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} />
              </linearGradient>
              <radialGradient id="goldJewelry" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style={{ stopColor: '#ffe066', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#bfa14a', stopOpacity: 1 }} />
              </radialGradient>
            </defs>

            {/* Hair - Long, wavy, flowing to one side */}
            <path
              d="M60 30 Q 30 80, 60 170 Q 100 200, 160 170 Q 180 120, 140 100 Q 180 80, 120 30 Q 110 10, 100 30 Q 90 10, 60 30"
              fill="url(#hairShading)"
            />

            {/* Face shape with pointed jaw and cheekbones */}
            <path
              d="M100 40 Q 130 50, 140 90 Q 145 130, 100 160 Q 55 130, 60 90 Q 70 50, 100 40"
              fill="#FFF6ED"
            />
            {/* Face shading */}
            <path
              d="M100 40 Q 130 50, 140 90 Q 145 130, 100 160 Q 55 130, 60 90 Q 70 50, 100 40"
              fill="url(#faceShading)"
            />

            {/* Ears with earrings */}
            <ellipse cx="60" cy="100" rx="7" ry="15" fill="#F9E3D3" />
            <ellipse cx="140" cy="100" rx="7" ry="15" fill="#F9E3D3" />
            {/* Earrings */}
            <ellipse cx="60" cy="120" rx="5" ry="8" fill="url(#goldJewelry)" stroke="#bfa14a" strokeWidth="1" />
            <ellipse cx="140" cy="120" rx="5" ry="8" fill="url(#goldJewelry)" stroke="#bfa14a" strokeWidth="1" />
            <circle cx="60" cy="132" r="2.5" fill="url(#goldJewelry)" />
            <circle cx="140" cy="132" r="2.5" fill="url(#goldJewelry)" />

            {/* Hair - Front, framing face */}
            <path
              d="M60 30 Q 80 60, 100 55 Q 120 60, 140 30 Q 150 60, 140 90 Q 130 60, 100 60 Q 70 60, 60 90 Q 50 60, 60 30"
              fill="#2C1810"
              opacity="0.9"
            />

            {/* Eyes */}
            <ellipse cx="85" cy="95" rx="8" ry="5" fill="#fff" />
            <ellipse cx="115" cy="95" rx="8" ry="5" fill="#fff" />
            <ellipse cx="85" cy="95" rx="4" ry="4" fill="#6B3F2B" />
            <ellipse cx="115" cy="95" rx="4" ry="4" fill="#6B3F2B" />
            <ellipse cx="84" cy="94" rx="1.2" ry="1.2" fill="#222" />
            <ellipse cx="114" cy="94" rx="1.2" ry="1.2" fill="#222" />
            {/* Eye shine */}
            <ellipse cx="83" cy="93" rx="0.7" ry="0.7" fill="#fff" />
            <ellipse cx="113" cy="93" rx="0.7" ry="0.7" fill="#fff" />

            {/* Eyebrows */}
            <path d="M75 85 Q 85 80, 95 85" stroke="#2C1810" strokeWidth="2" fill="none" />
            <path d="M105 85 Q 115 80, 125 85" stroke="#2C1810" strokeWidth="2" fill="none" />

            {/* Nose */}
            <path d="M100 105 Q 98 115, 100 120 Q 102 115, 100 105" stroke="#E2BFA3" strokeWidth="1.2" fill="none" />

            {/* Lips - gentle smile */}
            <motion.path
              d={isSpeaking ? "M85 130 Q 100 140, 115 130 Q 100 145, 85 130" : "M90 130 Q 100 135, 110 130 Q 100 138, 90 130"}
              stroke="#E2A6A3"
              strokeWidth="1.5"
              fill="none"
              animate={{
                d: isSpeaking
                  ? [
                      "M85 130 Q 100 140, 115 130 Q 100 145, 85 130",
                      "M90 130 Q 100 135, 110 130 Q 100 138, 90 130",
                      "M85 130 Q 100 140, 115 130 Q 100 145, 85 130",
                    ]
                  : "M90 130 Q 100 135, 110 130 Q 100 138, 90 130"
              }}
              transition={{
                duration: 0.5,
                repeat: isSpeaking ? Infinity : 0,
                repeatType: "reverse"
              }}
            />

            {/* Cheek and chin shading for depth */}
            <ellipse cx="85" cy="120" rx="8" ry="3" fill="#F9E3D3" opacity="0.3" />
            <ellipse cx="115" cy="120" rx="8" ry="3" fill="#F9E3D3" opacity="0.3" />
            <ellipse cx="100" cy="145" rx="15" ry="5" fill="#F9E3D3" opacity="0.2" />

            {/* Necklace - layered */}
            <ellipse cx="100" cy="170" rx="32" ry="7" fill="url(#goldJewelry)" opacity="0.8" />
            <ellipse cx="100" cy="175" rx="28" ry="5" fill="url(#goldJewelry)" opacity="0.7" />
            <ellipse cx="100" cy="180" rx="22" ry="3" fill="url(#goldJewelry)" opacity="0.6" />
            <circle cx="100" cy="185" r="4" fill="url(#goldJewelry)" />

            {/* Saree blouse hint at shoulders */}
            <path d="M55 160 Q 80 170, 100 165 Q 120 170, 145 160 Q 150 200, 50 200 Q 55 160, 55 160" fill="url(#sareeBlouse)" opacity="0.85" />
          </svg>
        </div>
        
        {/* Stop Button - Only show when speaking */}
        {isSpeaking && (
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                if (isStoppedRef.current) return;
                isStoppedRef.current = true;
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                onStopSpeaking?.();
              }}
              className="bg-red-600/80 backdrop-blur-sm border border-red-500/30 rounded-full p-2 shadow hover:bg-red-500/80 transition-colors"
              title="Stop speaking"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
              </svg>
            </button>
            
            <span className="text-purple-200 text-sm">
              Speaking... (click to stop)
            </span>
          </div>
        )}

        {/* Error Message */}
        {voiceError && (
          <div className="text-red-400 text-xs mt-2 text-center max-w-xs">
            {!isPermissionGranted 
              ? "Speech not available. Please check browser settings."
              : "Voice loading failed. Try refreshing the page."}
          </div>
        )}
      </div>
    );
  }
);

export default SpeakingAvatar; 