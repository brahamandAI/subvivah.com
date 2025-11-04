'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Sparkles, Heart, Star, MapPin, GraduationCap, Briefcase, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import StaticMatches from '@/components/StaticMatches';

interface MatchedProfile {
  id: string;
  userId: string;
  height: string | null;
  maritalStatus: string | null;
  religion: string | null;
  caste: string | null;
  education: string | null;
  occupation: string | null;
  workLocation: string | null;
  aboutMe: string | null;
  user: {
    firstName: string;
    lastName: string;
    dob: string;
    photos: {
      url: string;
      isProfile: boolean;
    }[];
  };
}

interface Match {
  profile: MatchedProfile;
  matchScore: number;
  matchingCriteria: string[];
  isBestMatch: boolean;
}

interface Preferences {
  ageFrom: number | null;
  ageTo: number | null;
  heightFrom: string | null;
  heightTo: string | null;
  maritalStatus: string | null;
  religion: string | null;
  caste: string | null;
  education: string | null;
  occupation: string | null;
  location: string | null;
  income: string | null;
}

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        
        if (data.isAuthenticated) {
          fetchData(data.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchData = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch preferences
      const preferencesResponse = await fetch(`/api/preferences?userId=${userId}`);
      if (preferencesResponse.ok) {
        const prefsData = await preferencesResponse.json();
        setPreferences(prefsData);
      }

      // Get spotlight match first (this is the same one shown in the bubble)
      const spotlightResponse = await fetch(`/api/spotlight?userId=${userId}`);
      let bestMatch = null;
      if (spotlightResponse.ok) {
        const spotlightData = await spotlightResponse.json();
        if (spotlightData.matchedProfile) {
          bestMatch = {
            profile: spotlightData.matchedProfile,
            matchScore: spotlightData.matchScore,
            matchingCriteria: spotlightData.matchingCriteria,
            isBestMatch: true
          };
        }
      }

      // Get all matches
      const allMatchesResponse = await fetch(`/api/spotlight?userId=${userId}&all=true`);
      if (!allMatchesResponse.ok) {
        const errorData = await allMatchesResponse.json();
        setError(errorData.details || errorData.error || 'Failed to fetch matches');
        return;
      }

      const data = await allMatchesResponse.json();
      if (!data.matches || data.matches.length === 0) {
        setError('No matches found based on your preferences.');
        return;
      }

      // Show ALL matches, sorted by score (best matches first)
      const filteredMatches = data.matches
        .map((match: any) => ({
          ...match,
          isBestMatch: false
        }));

      if (filteredMatches.length === 0 && !bestMatch) {
        setError('No matches found based on your preferences. Try updating your preferences to find more matches.');
        return;
      }

      // Combine best match with other matches
      const allMatches = bestMatch 
        ? [bestMatch, ...filteredMatches.filter((m: Match) => m.profile.userId !== bestMatch.profile.userId)]
        : filteredMatches;

      setMatches(allMatches);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-md z-0" />
        <div className="relative z-10 flex flex-col items-center">
          <svg className="animate-spin h-14 w-14 text-purple-300 mb-4" viewBox="0 0 50 50">
            <circle className="opacity-20" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" />
            <circle className="opacity-70" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" strokeDasharray="31.4 94.2" />
          </svg>
          <span className="text-purple-200 text-lg font-medium animate-pulse">Loading matches...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <StaticMatches />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-semibold text-white mb-4">No Matches Found</h2>
          <p className="text-purple-200 mb-6">{error}</p>
          <button
            onClick={() => router.push('/preferences')}
            className="inline-block w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700"
          >
            Update Preferences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            Your Perfect Matches
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400" />
          </h1>
          <p className="text-base sm:text-lg text-purple-200">
            Discover people who share your values and interests
          </p>
        </div>

        {/* Preferences Section - Moved to top */}
        {preferences && (
          <div className="mb-8 sm:mb-12 bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Your Preferences</h2>
              <button
                onClick={() => router.push('/preferences')}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm sm:text-base"
              >
                Update Preferences
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {preferences.ageFrom && preferences.ageTo && (
                <div className="bg-white/5 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Age Range</h3>
                  <p className="text-purple-200 text-sm">{preferences.ageFrom} - {preferences.ageTo} years</p>
                </div>
              )}
              {preferences.location && (
                <div className="bg-white/5 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Location</h3>
                  <p className="text-purple-200 text-sm">{preferences.location}</p>
                </div>
              )}
              {preferences.religion && (
                <div className="bg-white/5 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Religion</h3>
                  <p className="text-purple-200 text-sm">{preferences.religion}</p>
                </div>
              )}
              {preferences.caste && (
                <div className="bg-white/5 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Caste</h3>
                  <p className="text-purple-200 text-sm">{preferences.caste}</p>
                </div>
              )}
              {preferences.education && (
                <div className="bg-white/5 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Education</h3>
                  <p className="text-purple-200 text-sm">{preferences.education}</p>
                </div>
              )}
              {preferences.occupation && (
                <div className="bg-white/5 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Occupation</h3>
                  <p className="text-purple-200 text-sm">{preferences.occupation}</p>
                </div>
              )}
              {preferences.heightFrom && preferences.heightTo && (
                <div className="bg-white/5 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Height Range</h3>
                  <p className="text-purple-200 text-sm">{preferences.heightFrom} - {preferences.heightTo}</p>
                </div>
              )}
              {preferences.income && (
                <div className="bg-white/5 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Income</h3>
                  <p className="text-purple-200 text-sm">{preferences.income}</p>
                </div>
              )}
              {preferences.maritalStatus && (
                <div className="bg-white/5 rounded-lg p-4 sm:p-6">
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Marital Status</h3>
                  <p className="text-purple-200 text-sm">{preferences.maritalStatus}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spotlight Match */}
        {matches.length > 0 && matches[0]?.isBestMatch && matches[0]?.profile && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              Today's Best Match
            </h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-72 sm:h-96 md:h-auto">
                  <Image
                    src={matches[0]?.profile?.user?.photos?.[0]?.url || '/images/placeholder.png'}
                    alt={`${matches[0]?.profile?.user?.firstName || 'Profile'} photo`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-xl md:rounded-l-xl md:rounded-t-none"
                  />
                </div>
                <div className="p-4 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {matches[0]?.profile?.user?.firstName} {matches[0]?.profile?.user?.lastName}
                    </h3>
                    <div className="bg-purple-600/30 text-purple-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium self-start sm:self-center">
                      {matches[0]?.matchScore}% Match
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4 mb-6">
                    {matches[0]?.profile?.workLocation && (
                      <div className="flex items-center gap-2 text-purple-200 text-sm sm:text-base">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span>{matches[0].profile.workLocation}</span>
                      </div>
                    )}
                    {matches[0]?.profile?.education && (
                      <div className="flex items-center gap-2 text-purple-200 text-sm sm:text-base">
                        <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span>{matches[0].profile.education}</span>
                      </div>
                    )}
                    {matches[0]?.profile?.occupation && (
                      <div className="flex items-center gap-2 text-purple-200 text-sm sm:text-base">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span>{matches[0].profile.occupation}</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3 text-sm sm:text-base">Why You Match</h4>
                    <div className="flex flex-wrap gap-2">
                      {matches[0]?.matchingCriteria?.map((criteria, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-xs sm:text-sm"
                        >
                          {criteria}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center mt-6 sm:mt-8">
                    <Link
                      href={`/matches/matched-profile?userId=${matches[0]?.profile?.userId}`}
                      className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg text-center hover:bg-purple-700 transition-colors font-medium text-sm sm:text-base"
                    >
                      View Full Profile
                    </Link>
                    <Link
                      href={`/messages?userId=${matches[0]?.profile?.userId}`}
                      className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-center hover:from-pink-600 hover:to-purple-600 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      Message
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Matches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {matches.slice(1).map((match) => match?.profile && (
            <div
              key={match.profile.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative h-56 sm:h-64">
                <Image
                  src={match?.profile?.user?.photos?.[0]?.url || '/images/placeholder.png'}
                  alt={`${match?.profile?.user?.firstName || 'Profile'} photo`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-xl"
                />
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    {match?.profile?.user?.firstName} {match?.profile?.user?.lastName}
                  </h3>
                  <div className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm font-medium self-start sm:self-center">
                    {match?.matchScore}% Match
                  </div>
                </div>
                {match?.profile?.workLocation && (
                  <p className="text-purple-200 mb-4 flex items-center gap-2 text-sm sm:text-base">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    {match.profile.workLocation}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-6">
                  {match?.matchingCriteria?.slice(0, 3).map((criteria, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-xs sm:text-sm"
                    >
                      {criteria}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 justify-center mt-4 sm:mt-6">
                  <Link
                    href={`/matches/matched-profile?userId=${match?.profile?.userId}`}
                    className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-center hover:bg-purple-700 transition-colors font-medium text-sm sm:text-base"
                  >
                    View Full Profile
                  </Link>
                  <Link
                    href={`/messages?userId=${match?.profile?.userId}`}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-center hover:from-pink-600 hover:to-purple-600 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 