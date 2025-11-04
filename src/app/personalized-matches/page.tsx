'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StaticPersonalizedMatches from '@/components/StaticPersonalizedMatches';

interface MatchProfile {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    photos: { url: string; isProfile: boolean }[];
  };
  matchScore: number;
  matchingCriteria: string[];
}

interface ErrorState {
  message: string;
  code?: string;
  suggestion?: string;
}

export default function PersonalizedMatches() {
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const router = useRouter();
  const { language } = useLanguage();

  // Memoize fetchMatches to prevent recreation on every render
  const fetchMatches = useCallback(async () => {
    try {
      const response = await fetch('/api/matches/personalized', {
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage: ErrorState = {
          message: 'Failed to fetch matches',
          code: 'UNKNOWN_ERROR'
        };

        if (response.status === 401) {
          errorMessage = {
            message: t[language].error.notAuthenticated,
            code: 'NOT_AUTHENTICATED',
            suggestion: 'Please login to view personalized matches.'
          };
          throw errorMessage;
        }

        if (response.status === 400) {
          const data = await response.json();
          if (data.error === 'Personalization not completed') {
            errorMessage = {
              message: 'To get personalized matches, please complete your AI personalization first.',
              code: 'AI_NOT_COMPLETE',
              suggestion: 'Answer all questions to help us find your perfect match.'
            };
          }
        }

        throw errorMessage;
      }

      const data = await response.json();
      setMatches(data);
    } catch (err) {
      console.error('Error fetching matches:', err);
      if (err instanceof Error) {
        setError({
          message: t[language].error.networkError,
          code: 'NETWORK_ERROR',
          suggestion: 'Please check your internet connection and try again.'
        });
      } else if (typeof err === 'object' && err !== null) {
        setError(err as ErrorState);
      } else {
        setError({
          message: t[language].error.unknownError,
          code: 'UNKNOWN_ERROR',
          suggestion: 'Please try refreshing the page.'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [language, router]);

  // Only fetch on mount and language change
  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleSendInterest = useCallback(async (matchId: string) => {
    try {
      const response = await fetch('/api/interests/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId: matchId }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to send interest');
      }

      // Update UI to show interest sent
      setMatches(prevMatches => 
        prevMatches.map(match => 
          match.id === matchId 
            ? { ...match, interestSent: true }
            : match
        )
      );
    } catch (error) {
      console.error('Error sending interest:', error);
    }
  }, []);

  const t = {
    hi: {
      title: 'व्यक्तिगत मैच',
      subtitle: 'AI द्वारा चुने गए आपके लिए सर्वश्रेष्ठ मैच',
      loading: 'आपके लिए सर्वश्रेष्ठ मैच खोज रहे हैं...',
      error: {
        title: 'एक त्रुटि हुई है',
        tryAgain: 'पुनः प्रयास करें',
        goToProfile: 'प्रोफ़ाइल पर जाएं',
        notAuthenticated: 'कृपया लॉगिन करें',
        aiNotComplete: 'संगत प्रोफाइल के साथ मैच करने के लिए अपना व्यक्तिगतकरण पूरा करें।',
        networkError: 'नेटवर्क त्रुटि',
        serverError: 'सर्वर त्रुटि',
        unknownError: 'अज्ञात त्रुटि'
      },
      noMatches: 'कोई मैच नहीं मिला',
      viewProfile: 'प्रोफ़ाइल देखें',
      sendInterest: 'रुचि भेजें',
      message: 'संदेश',
      matchScore: 'मैच स्कोर',
      compatibility: 'संगतता',
    },
    en: {
      title: 'Personalized Matches',
      subtitle: 'Best matches for you, chosen by AI',
      loading: 'Finding your best matches...',
      error: {
        title: 'An Error Occurred',
        tryAgain: 'Try Again',
        goToProfile: 'Go to Profile',
        notAuthenticated: 'Please Login',
        aiNotComplete: 'Complete your personalization to get matched with compatible profiles.',
        networkError: 'Network Error',
        serverError: 'Server Error',
        unknownError: 'Unknown Error'
      },
      noMatches: 'No matches found',
      viewProfile: 'View Profile',
      sendInterest: 'Send Interest',
      message: 'Message',
      matchScore: 'Match Score',
      compatibility: 'Compatibility',
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-200">{t[language].loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Show static component for unauthenticated users
    if (error.code === 'NOT_AUTHENTICATED') {
      return <StaticPersonalizedMatches />;
    }

    // Special handling for AI personalization incomplete - show friendly prompt instead of error
    if (error.code === 'AI_NOT_COMPLETE') {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-purple-400">
                AI Personalization Required
              </h2>
              <p className="text-lg mb-2 text-white">
                {error.message}
              </p>
              {error.suggestion && (
                <p className="text-sm mb-6 text-gray-300">
                  {error.suggestion}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/ai-personalization"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Start AI Personalization
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Handle other errors with the original error UI
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-lg rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-500">
              {t[language].error.title}
            </h2>
            <p className="text-lg mb-2 text-white">
              {error.message}
            </p>
            {error.suggestion && (
              <p className="text-sm mb-6 text-gray-300">
                {error.suggestion}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchMatches();
                }}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                {t[language].error.tryAgain}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">{t[language].title}</h1>
        <p className="text-gray-300">{t[language].subtitle}</p>
      </motion.div>

      {/* Match Summary */}
      {matches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-purple-600/20 backdrop-blur-sm rounded-lg p-4 mb-8 border border-purple-500/30"
        >
          <div className="text-center">
            <p className="text-purple-200 text-lg">
              Found <span className="font-semibold text-white">{matches.length}</span> compatible matches
            </p>
            <p className="text-purple-300 text-sm mt-1">
              Showing profiles with at least one matching preference
            </p>
          </div>
        </motion.div>
      )}

      {matches.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>{t[language].noMatches}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10 hover:border-purple-500/30"
            >
              <Link href={`/personalized-matches/${match.id}`} className="block">
                <div className="relative h-72 overflow-hidden">
                <Image
                  src={match.user.photos.find(p => p.isProfile)?.url || '/default-profile.jpg'}
                  alt={`${match.user.firstName}'s photo`}
                  fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  
                  {/* Match score badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`
                      ${match.matchScore >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                        match.matchScore >= 50 ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 
                        'bg-gradient-to-r from-purple-500 to-pink-600'}
                      text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg
                    `}>
                      {match.matchScore}% Match
                </div>
              </div>

                  {/* Name and info at bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-200 transition-colors">
                  {match.user.firstName} {match.user.lastName}
                </h3>
                  </div>
                </div>
              </Link>

              <div className="p-5">
                {/* Matching criteria tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {match.matchingCriteria.slice(0, 3).map((criteria, i) => (
                    <span
                      key={i}
                      className={`
                        ${match.matchScore >= 70 ? 'bg-green-900/20 text-green-300' : 
                          match.matchScore >= 50 ? 'bg-blue-900/20 text-blue-300' : 
                          'bg-purple-900/20 text-purple-300'}
                        text-xs px-2.5 py-1 rounded-full
                      `}
                    >
                      {criteria}
                    </span>
                  ))}
                  {match.matchingCriteria.length > 3 && (
                    <span className="bg-purple-900/20 text-purple-300 text-xs px-2.5 py-1 rounded-full">
                      +{match.matchingCriteria.length - 3} more
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-center items-center mt-4">
                    <Link
                      href={`/personalized-matches/${match.id}`}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium text-center"
                    >
                    View Profile
                    </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 