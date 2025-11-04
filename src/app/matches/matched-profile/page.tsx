'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { Sparkles, Heart, MessageCircle, Star } from 'lucide-react';
import { capitalizeWords } from '@/utils/textFormatting';

interface MatchedProfile {
  id: string;
  userId: string;
  height: string | null;
  weight: string | null;
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
      caption?: string;
    }[];
  };
}

interface SpotlightMatch {
  matchScore: number;
  matchingCriteria: string[];
}

interface MatchCriteria {
  name: string;
  score: number;
  matched: boolean;
}

interface AIAnalysis {
  analysis: string;
  userProfile: {
    name: string;
    education: string | null;
    occupation: string | null;
    location: string | null;
    about: string | null;
  };
  matchedProfile: {
    name: string;
    education: string | null;
    occupation: string | null;
    location: string | null;
    about: string | null;
  };
}

function MatchedProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<MatchedProfile | null>(null);
  const [spotlightMatch, setSpotlightMatch] = useState<SpotlightMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isSpotlightMatch, setIsSpotlightMatch] = useState(false);

  useEffect(() => {
    const fetchMatchedProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!searchParams) {
          setError('Invalid search parameters');
          return;
        }

        const matchedUserId = searchParams.get('userId');
        if (!matchedUserId) {
          setError('No user ID provided');
          return;
        }

        // Get current user
        const userResponse = await fetch('/api/auth/me');
        const userData = await userResponse.json();
        
        if (!userData.isAuthenticated || !userData.user) {
          if (typeof window !== 'undefined' && window.showRegisterPopup) {
              window.showRegisterPopup();
            }
          return;
        }

        // Get matched profile
        const profileResponse = await fetch(`/api/profiles/${matchedUserId}`);
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          setError(errorData.details || errorData.error || 'Failed to fetch profile');
          return;
        }

        const profileData = await profileResponse.json();
        if (!profileData || !profileData.user) {
          setError('Profile data is incomplete');
          return;
        }
        
        setProfile(profileData);

        // Get spotlight matches to check if this is the best match
        const spotlightResponse = await fetch(`/api/spotlight?userId=${userData.user.id}&all=true`);
        if (spotlightResponse.ok) {
          const spotlightData = await spotlightResponse.json();
          if (spotlightData.matches && spotlightData.matches.length > 0) {
            const bestMatch = spotlightData.matches
              .sort((a: any, b: any) => b.matchScore - a.matchScore)[0];
            
            // Check if current profile is the best match
            if (bestMatch.profile.userId === matchedUserId) {
              setIsSpotlightMatch(true);
              setSpotlightMatch({
                matchScore: bestMatch.matchScore,
                matchingCriteria: bestMatch.matchingCriteria
              });
            } else {
              // Find this profile in spotlight matches
              const currentMatch = spotlightData.matches.find(
                (m: any) => m.profile.userId === matchedUserId
              );
              if (currentMatch) {
                setSpotlightMatch({
                  matchScore: currentMatch.matchScore,
                  matchingCriteria: currentMatch.matchingCriteria
                });
              }
            }
          }
        }

        // Fetch AI analysis
        setAnalyzing(true);
        try {
          const analysisResponse = await fetch('/api/ai/match-analysis', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userData.user.id,
              matchedUserId: matchedUserId
            })
          });

          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            setAiAnalysis(analysisData);
          }
        } catch (error) {
          console.error('Error fetching AI analysis:', error);
        } finally {
          setAnalyzing(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchedProfile();
  }, [router, searchParams]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-semibold text-white mb-4">No Match Found</h2>
          <p className="text-purple-200 mb-6">{error}</p>
          <div className="space-y-4">
            <Link
              href="/preferences"
              className="inline-block w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700"
            >
              Update Preferences
            </Link>
            <Link
              href="/matches"
              className="inline-block w-full border border-white/20 text-white px-6 py-3 rounded-md hover:bg-white/5"
            >
              Back to Matches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const age = new Date().getFullYear() - new Date(profile.user.dob).getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 py-12 relative overflow-hidden">
      {/* Decorative animated sparkle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-white rounded-full animate-sparkle" style={{ top: '20%', left: '10%' }} />
        <div className="absolute w-2 h-2 bg-white rounded-full animate-sparkle" style={{ top: '60%', left: '80%' }} />
        <div className="absolute w-2 h-2 bg-white rounded-full animate-sparkle" style={{ top: '80%', left: '30%' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
          {/* Profile Header */}
          <div className="relative h-96">
            {profile.user.photos?.[0] ? (
              <Image
                src={profile.user.photos[0].url}
                alt={`${profile.user.firstName}'s profile`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-white">
                      {profile.user.firstName[0]}{profile.user.lastName[0]}
                    </span>
                  </div>
                  <p className="text-purple-200">No photo available</p>
                </div>
              </div>
            )}
            {isSpotlightMatch && (
              <div className="absolute top-4 left-4 bg-yellow-400 text-indigo-900 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                <Star className="w-5 h-5" />
                Best Match
              </div>
            )}
            <div className={`absolute top-4 right-4 ${isSpotlightMatch ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-purple-600'} text-white px-4 py-2 rounded-full font-medium`}>
              {spotlightMatch?.matchScore}% Match
            </div>
          </div>

          {/* Photo Gallery Section */}
          {profile.user.photos && profile.user.photos.length > 1 && (
            <div className="px-8 py-6 border-t border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Photo Gallery</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {profile.user.photos.map((photo, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow group flex flex-col">
                    <div className="relative w-full aspect-square">
                      <Image
                        src={photo.url}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                        sizes="300px"
                      />
                    </div>
                    {/* Caption if available */}
                    {photo.caption && (
                      <div className="p-2 text-center bg-white/10 backdrop-blur-sm">
                        <p className="text-xs text-purple-200 truncate">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Content */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              {profile.user.firstName} {profile.user.lastName}, {age}
            </h1>

            {/* Matching Criteria */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">Matching Criteria</h2>
              <div className="flex flex-wrap gap-2">
                {spotlightMatch?.matchingCriteria.map((criteria: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-600/30 text-purple-200"
                  >
                    {criteria}
                  </span>
                ))}
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
                <dl className="space-y-3">
                  {profile.height && (
                    <div>
                      <dt className="text-sm font-medium text-purple-200">Height</dt>
                      <dd className="text-white">{capitalizeWords(profile.height)}</dd>
                    </div>
                  )}
                  {profile.weight && (
                    <div>
                      <dt className="text-sm font-medium text-purple-200">Weight</dt>
                      <dd className="text-white">{capitalizeWords(profile.weight)}</dd>
                    </div>
                  )}
                  {profile.maritalStatus && (
                    <div>
                      <dt className="text-sm font-medium text-purple-200">Marital Status</dt>
                      <dd className="text-white">{capitalizeWords(profile.maritalStatus)}</dd>
                    </div>
                  )}
                  {profile.religion && (
                    <div>
                      <dt className="text-sm font-medium text-purple-200">Religion</dt>
                      <dd className="text-white">{capitalizeWords(profile.religion)}</dd>
                    </div>
                  )}
                  {profile.caste && (
                    <div>
                      <dt className="text-sm font-medium text-purple-200">Caste</dt>
                      <dd className="text-white">{capitalizeWords(profile.caste)}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Professional Information</h2>
                <dl className="space-y-3">
                  {profile.education && (
                    <div>
                      <dt className="text-sm font-medium text-purple-200">Education</dt>
                      <dd className="text-white">{capitalizeWords(profile.education)}</dd>
                    </div>
                  )}
                  {profile.occupation && (
                    <div>
                      <dt className="text-sm font-medium text-purple-200">Occupation</dt>
                      <dd className="text-white">{capitalizeWords(profile.occupation)}</dd>
                    </div>
                  )}
                  {profile.workLocation && (
                    <div>
                      <dt className="text-sm font-medium text-purple-200">Work Location</dt>
                      <dd className="text-white">{capitalizeWords(profile.workLocation)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* About Me */}
            {profile.aboutMe && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-white mb-2">About Me</h2>
                <p className="text-purple-200">{profile.aboutMe}</p>
              </div>
            )}

            {/* AI Analysis */}
            <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-200" />
                AI Match Analysis
              </h2>
              {analyzing ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-200"></div>
                </div>
              ) : aiAnalysis ? (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-line text-purple-200">
                    {aiAnalysis.analysis}
                  </div>
                </div>
              ) : (
                <p className="text-purple-200">Unable to generate analysis at this time.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <Link
                href="/matches"
                className="px-4 py-2 border border-white/20 rounded-lg text-sm font-medium text-white hover:bg-white/5"
              >
                Back to Matches
              </Link>
              <button
                onClick={() => {/* Implement interest functionality */}}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Show Interest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(MatchedProfilePage); 