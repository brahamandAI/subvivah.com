'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  User as UserIcon, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Heart, 
  MessageCircle, 
  Star,
  Calendar,
  Languages,
  Home,
  Users,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ArrowLeft,
  CheckCircle,
  User,
  DollarSign
} from 'lucide-react';
import { capitalizeWords } from '@/utils/textFormatting';
import withAuth from '@/components/withAuth';

interface UserProfile {
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
  motherTongue: string | null;
  annualIncome: string | null;
  familyType: string | null;
  familyValues: string | null;
  familyStatus: string | null;
  familyLocation: string | null;
  matchingCriteria?: string[];
  matchScore?: number;
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

function PersonalizedMatchProfilePage() {
  const router = useRouter();
  const { userId } = useParams() as { userId: string };
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const sortPhotos = (photos: { url: string; isProfile: boolean; caption?: string }[]) => {
    return [...photos].sort((a, b) => {
      if (a.isProfile && !b.isProfile) return -1;
      if (!a.isProfile && b.isProfile) return 1;
      return 0;
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/personalized-matches/${userId}`);
        if (!response.ok) {
          throw new Error('Profile not found');
        }
        const data = await response.json();
        // Sort photos to prioritize profile picture
        if (data.user.photos) {
          data.user.photos = sortPhotos(data.user.photos);
        }
        setProfile(data);
      } catch (error) {
        setError('Profile not found');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handlePreviousPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile?.user.photos && profile.user.photos.length > 0) {
      setSelectedPhotoIndex((prev) => 
        prev === 0 ? profile.user.photos.length - 1 : prev - 1
      );
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile?.user.photos && profile.user.photos.length > 0) {
      setSelectedPhotoIndex((prev) => 
        prev === profile.user.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const openPhotoGallery = (index: number = 0) => {
    setSelectedPhotoIndex(index);
    setShowPhotoGallery(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Profile Not Found</h2>
          <p className="text-purple-200 mb-6">{error}</p>
          <Link
            href="/personalized-matches"
            className="inline-block border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/5"
          >
            Back to Personalized Matches
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const age = new Date().getFullYear() - new Date(profile.user.dob).getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Personalized Matches
        </button>

        {/* Main Profile Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 shadow-xl">
          {/* Profile Header */}
          <div className="relative">
            {/* Main Photo */}
            <div className="aspect-[3/2] sm:aspect-[2/1] lg:aspect-[2/1] relative overflow-hidden">
              {profile?.user.photos && profile.user.photos.length > 0 ? (
                <Image
                  src={profile.user.photos[selectedPhotoIndex].url}
                  alt={`${profile.user.firstName} ${profile.user.lastName}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-purple-900/50 flex items-center justify-center">
                  <UserIcon className="w-20 h-20 text-white/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* User Name and Age */}
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-3xl font-bold mb-2">
                  {capitalizeWords(profile.user.firstName)} {capitalizeWords(profile.user.lastName)}
                </h1>
                <p className="text-lg text-white/90">{age} years old</p>
              </div>
            </div>

            {/* Photo Gallery Preview */}
            {profile.user.photos && profile.user.photos.length > 1 && (
              <div className="absolute bottom-6 right-6 flex space-x-2">
                {profile.user.photos.slice(0, 5).map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      openPhotoGallery(idx);
                    }}
                    className={`w-10 h-10 rounded-md overflow-hidden border-2 transition-all ${
                      selectedPhotoIndex === idx ? 'border-pink-500 scale-110' : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={photo.url}
                        alt={`${profile.user.firstName}'s photo ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
                {profile.user.photos.length > 5 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPhotoGallery(5);
                    }}
                    className="w-10 h-10 rounded-md flex items-center justify-center bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors"
                  >
                    +{profile.user.photos.length - 5}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Match Score Section */}
            {profile.matchScore !== undefined && profile.matchingCriteria && (
              <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                  <div className={`
                    ${profile.matchScore >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                      profile.matchScore >= 50 ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 
                      'bg-gradient-to-r from-purple-500 to-pink-600'}
                    text-white px-5 py-2.5 rounded-full text-lg font-semibold shadow-lg flex items-center gap-2
                  `}>
                    <span className="text-2xl">{profile.matchScore}%</span>
                    <span className="text-sm opacity-90">Match</span>
                  </div>
                  <div className="text-purple-300 mt-2 sm:mt-0">
                    {profile.matchScore >= 70 ? 'Excellent Match' :
                     profile.matchScore >= 50 ? 'Great Match' :
                     profile.matchScore >= 30 ? 'Good Match' : 'Compatible'}
                  </div>
                </div>
                {profile.matchingCriteria && profile.matchingCriteria.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      What You Have in Common
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {profile.matchingCriteria.map((criteria, index) => (
                        <div key={index} className="flex items-center gap-2 text-purple-200 bg-purple-800/20 px-3 py-2 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span>{criteria}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* About Me Section */}
            {profile.aboutMe && (
              <div className="text-white/90 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-300" />
                  About Me
                </h2>
                <p className="leading-relaxed">{capitalizeWords(profile.aboutMe)}</p>
              </div>
            )}

            {/* Basic Details and Education & Career in a grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-300" />
                  Basic Details
                </h2>
              <div className="space-y-4">
                  {profile.maritalStatus && (
                    <div className="flex items-center gap-3 text-white/80">
                      <div className="w-9 h-9 rounded-full bg-purple-900/50 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Marital Status</p>
                        <p className="text-white">{capitalizeWords(profile.maritalStatus)}</p>
                      </div>
                    </div>
                  )}
                  {profile.religion && (
                    <div className="flex items-center gap-3 text-white/80">
                      <div className="w-9 h-9 rounded-full bg-purple-900/50 flex items-center justify-center">
                        <Star className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Religion</p>
                        <p className="text-white">{capitalizeWords(profile.religion)}</p>
                      </div>
                    </div>
                  )}
                  {profile.caste && (
                    <div className="flex items-center gap-3 text-white/80">
                      <div className="w-9 h-9 rounded-full bg-purple-900/50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Caste</p>
                        <p className="text-white">{capitalizeWords(profile.caste)}</p>
                      </div>
                    </div>
                  )}
                  {profile.motherTongue && (
                    <div className="flex items-center gap-3 text-white/80">
                      <div className="w-9 h-9 rounded-full bg-purple-900/50 flex items-center justify-center">
                        <Languages className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Mother Tongue</p>
                        <p className="text-white">{capitalizeWords(profile.motherTongue)}</p>
                      </div>
                    </div>
                  )}
                  {profile.familyType && (
                    <div className="flex items-center gap-3 text-white/80">
                      <div className="w-9 h-9 rounded-full bg-purple-900/50 flex items-center justify-center">
                        <Home className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Family Type</p>
                        <p className="text-white">{capitalizeWords(profile.familyType)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-300" />
                  Education & Career
                </h2>
              <div className="space-y-4">
                  {profile.education && (
                    <div className="flex items-center gap-3 text-white/80">
                      <div className="w-9 h-9 rounded-full bg-purple-900/50 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Education</p>
                        <p className="text-white">{capitalizeWords(profile.education)}</p>
                      </div>
                    </div>
                  )}
                  {profile.occupation && (
                    <div className="flex items-center gap-3 text-white/80">
                      <div className="w-9 h-9 rounded-full bg-purple-900/50 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Occupation</p>
                        <p className="text-white">{capitalizeWords(profile.occupation)}</p>
                      </div>
                    </div>
                  )}
                  {profile.workLocation && (
                    <div className="flex items-center gap-3 text-white/80">
                      <div className="w-9 h-9 rounded-full bg-purple-900/50 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Work Location</p>
                        <p className="text-white">{capitalizeWords(profile.workLocation)}</p>
                      </div>
                    </div>
                  )}
                  {profile.annualIncome && (
                    <div className="flex items-center gap-3 text-white/80">
                      <div className="w-9 h-9 rounded-full bg-purple-900/50 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Annual Income</p>
                        <p className="text-white">{capitalizeWords(profile.annualIncome)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => router.back()}
                className="bg-white/10 hover:bg-white/15 text-white px-8 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Matches
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showPhotoGallery && profile.user.photos && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setShowPhotoGallery(false)}
        >
          <div className="relative w-full max-w-4xl px-4">
            <div className="relative aspect-square">
              <Image
                src={profile.user.photos[selectedPhotoIndex].url}
                alt={`${profile.user.firstName} ${profile.user.lastName}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Navigation Buttons */}
            {profile.user.photos.length > 1 && (
              <>
                <button
                  onClick={handlePreviousPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={() => setShowPhotoGallery(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(PersonalizedMatchProfilePage); 