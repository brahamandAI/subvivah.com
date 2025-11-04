'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, UserIcon, X, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PersonalizedMatch {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    gender: string;
    photos: Array<{ url: string }>;
    education?: string;
    occupation?: string;
    workLocation?: string;
  };
  matchScore: number;
  matchingCriteria: string[];
}

export default function PersonalizedMatches() {
  const [matches, setMatches] = useState<PersonalizedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PersonalizedMatch | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/matches/personalized', {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch matches');
      }

      const data = await response.json();
      // Sort matches by score
      const sortedMatches = data.sort((a: PersonalizedMatch, b: PersonalizedMatch) => b.matchScore - a.matchScore);
      setMatches(sortedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500/90';
    if (score >= 50) return 'bg-emerald-500/90';
    if (score >= 40) return 'bg-blue-500/90';
    return 'bg-purple-600/90';
  };

  const getScoreText = (score: number) => {
    if (score >= 70) return 'Excellent Match';
    if (score >= 50) return 'Great Match';
    if (score >= 40) return 'Good Match';
    return 'Compatible';
  };

  const handleUserClick = (match: PersonalizedMatch) => {
    setSelectedUser(match);
    setShowProfileModal(true);
  };

  const handleViewFullProfile = () => {
    if (selectedUser) {
      router.push(`/personalized-matches/${selectedUser.id}`);
      setShowProfileModal(false);
    }
  };

  const handleMessage = () => {
    if (selectedUser) {
      router.push(`/messages?userId=${selectedUser.id}`);
      setShowProfileModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-purple-900/40 backdrop-blur-sm rounded-lg p-6 text-center">
        <p className="text-purple-200 mb-2">
          {error === 'Personalization not completed' 
            ? 'Complete your AI personalization to see compatible matches.'
            : error}
        </p>
        {error === 'Personalization not completed' && (
          <p className="text-purple-300 text-sm">
            Answer all questions to help us find your perfect match.
          </p>
        )}
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="bg-purple-900/40 backdrop-blur-sm rounded-lg p-6 text-center">
        <p className="text-purple-200 mb-2">
          No compatible matches found at this time.
        </p>
        <p className="text-purple-300 text-sm">
          We're looking for profiles that match your preferences. Check back soon!
        </p>
      </div>
    );
  }

  // Group matches by score range
  const excellentMatches = matches.filter(m => m.matchScore >= 70);
  const greatMatches = matches.filter(m => m.matchScore >= 50 && m.matchScore < 70);
  const goodMatches = matches.filter(m => m.matchScore >= 40 && m.matchScore < 50);
  const otherMatches = matches.filter(m => m.matchScore < 40);

  const renderMatch = (match: PersonalizedMatch, index: number) => (
    <motion.div
      key={match.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`group bg-purple-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border ${
        match.matchScore >= 70 ? 'border-green-500/30 hover:border-green-500/50' :
        match.matchScore >= 50 ? 'border-emerald-500/30 hover:border-emerald-500/50' :
        'border-purple-500/20 hover:border-purple-500/40'
      } transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-purple-500/10`}
      onClick={() => handleUserClick(match)}
    >
      <div className="relative h-56 w-full overflow-hidden">
        {match.user.photos?.[0] ? (
          <Image
            src={match.user.photos[0].url}
            alt={`${match.user.firstName}'s profile`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
            <span className="text-4xl font-bold text-purple-200">
              {match.user.firstName[0]}{match.user.lastName[0]}
            </span>
          </div>
        )}
        <div className={`absolute top-3 right-3 ${getScoreColor(match.matchScore)} text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg`}>
          <span>{match.matchScore}%</span>
          {selectedMatch === match.id && (
            <span className="text-xs ml-1">• {getScoreText(match.matchScore)}</span>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        
        {/* Name on image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-semibold text-white">
          {match.user.firstName} {match.user.lastName}
        </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80 font-medium">
            {match.user.gender}
          </span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-2 mb-3">
          {match.user.workLocation && (
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <MapPin className="w-4 h-4 text-purple-300" />
              <span className="truncate">{match.user.workLocation}</span>
            </div>
          )}
          {match.user.education && (
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <GraduationCap className="w-4 h-4 text-purple-300" />
              <span className="truncate">{match.user.education}</span>
            </div>
          )}
          {match.user.occupation && (
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Briefcase className="w-4 h-4 text-purple-300" />
              <span className="truncate">{match.user.occupation}</span>
            </div>
          )}
        </div>
        
        <div className="pt-3 border-t border-white/10">
          <p className="text-xs text-purple-200 mb-2">Matching criteria:</p>
          <div className="flex flex-wrap gap-2">
          {match.matchingCriteria.slice(0, 3).map((criteria, idx) => (
            <span
              key={idx}
              className={`text-xs px-2 py-1 ${
                match.matchScore >= 70 ? 'bg-green-800/30 text-green-200' :
                match.matchScore >= 50 ? 'bg-emerald-800/30 text-emerald-200' :
                'bg-purple-800/50 text-purple-200'
              } rounded-full`}
            >
              {criteria}
            </span>
          ))}
          {match.matchingCriteria.length > 3 && (
            <span
              className={`text-xs px-2 py-1 ${
                match.matchScore >= 70 ? 'bg-green-800/30 text-green-200' :
                match.matchScore >= 50 ? 'bg-emerald-800/30 text-emerald-200' :
                'bg-purple-800/50 text-purple-200'
              } rounded-full`}
            >
              +{match.matchingCriteria.length - 3} more
            </span>
          )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {excellentMatches.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-green-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Excellent Matches
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {excellentMatches.map((match, index) => renderMatch(match, index))}
          </div>
        </div>
      )}

      {greatMatches.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-emerald-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Great Matches
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {greatMatches.map((match, index) => renderMatch(match, index))}
          </div>
        </div>
      )}

      {goodMatches.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-blue-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Good Matches
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {goodMatches.map((match, index) => renderMatch(match, index))}
          </div>
        </div>
      )}

      {otherMatches.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-purple-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Compatible Matches
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherMatches.map((match, index) => renderMatch(match, index))}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="bg-white/10 backdrop-blur-md rounded-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Photo */}
            <div className="relative">
              <div className="aspect-[4/3] relative">
                {selectedUser.user.photos && selectedUser.user.photos.length > 0 ? (
                  <Image
                    src={selectedUser.user.photos[0].url}
                    alt={`${selectedUser.user.firstName} ${selectedUser.user.lastName}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-purple-900/50 flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Name and Basic Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {selectedUser.user.firstName} {selectedUser.user.lastName}
                </h3>
                <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
                  <span className="text-sm text-white/80">
                    {selectedUser.user.gender}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <div className={`${getScoreColor(selectedUser.matchScore)} px-2 py-0.5 rounded-full text-white text-sm font-medium`}>
                    {selectedUser.matchScore}% • {getScoreText(selectedUser.matchScore)}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                {selectedUser.user.workLocation && (
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="w-5 h-5" />
                    <span>{selectedUser.user.workLocation}</span>
                  </div>
                )}
                {selectedUser.user.education && (
                  <div className="flex items-center gap-2 text-white/80">
                    <GraduationCap className="w-5 h-5" />
                    <span>{selectedUser.user.education}</span>
                  </div>
                )}
                {selectedUser.user.occupation && (
                  <div className="flex items-center gap-2 text-white/80">
                    <Briefcase className="w-5 h-5" />
                    <span>{selectedUser.user.occupation}</span>
                  </div>
                )}
              </div>

              {/* Matching Criteria */}
              <div>
                <h4 className="text-white/90 font-medium mb-2">Matching Criteria</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.matchingCriteria.map((criteria, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 ${
                        selectedUser.matchScore >= 70 ? 'bg-green-800/30 text-green-200' :
                        selectedUser.matchScore >= 50 ? 'bg-emerald-800/30 text-emerald-200' :
                        'bg-purple-800/50 text-purple-200'
                      } rounded-full`}
                    >
                      {criteria}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleViewFullProfile}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
                >
                  <UserIcon className="w-4 h-4" />
                  View Full Profile
                </button>
                <button
                  onClick={handleMessage}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 