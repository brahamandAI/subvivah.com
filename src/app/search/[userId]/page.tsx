'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  User, 
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
  ArrowLeft
} from 'lucide-react';
import { capitalizeWords } from '@/utils/textFormatting';

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

export default function UserProfilePage() {
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
        const response = await fetch(`/api/profiles/${userId}`);
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
            href="/search"
            className="inline-block border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/5"
          >
            Back to Search
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
          Back to Search
        </button>

        {/* Main Profile Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
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
                  <User className="w-20 h-20 text-white/30" />
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
            {profile?.user.photos && profile.user.photos.length > 0 && (
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                {/* Thumbnail Preview */}
                <div className="hidden sm:flex items-center gap-2">
                  {profile.user.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => openPhotoGallery(index)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedPhotoIndex === index ? 'border-purple-400' : 'border-white/20 hover:border-white/60'
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={photo.url}
                          alt={`Photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>

                {/* See All Photos Button */}
                <button
                  onClick={() => openPhotoGallery(0)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white flex items-center gap-2 transition-colors"
                >
                  <ZoomIn className="w-5 h-5" />
                  <span className="hidden sm:inline">View Photos</span>
                  <span className="sm:hidden">Photos ({profile.user.photos.length})</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="p-6 space-y-8">
            {/* About Me Section */}
            {profile.aboutMe && (
              <div className="text-white/90">
                <h2 className="text-xl font-semibold mb-3 text-white">About Me</h2>
                <p className="leading-relaxed">{capitalizeWords(profile.aboutMe)}</p>
              </div>
            )}

            {/* Basic Details and Education & Career in a grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Basic Details</h2>
                <div className="space-y-3">
                  {profile.maritalStatus && (
                    <div className="flex items-center gap-3 text-white/80">
                      <Heart className="w-5 h-5" />
                      <div>
                        <p className="text-white/60 text-sm">Marital Status</p>
                        <p>{capitalizeWords(profile.maritalStatus)}</p>
                      </div>
                    </div>
                  )}
                  {profile.religion && (
                    <div className="flex items-center gap-3 text-white/80">
                      <Star className="w-5 h-5" />
                      <div>
                        <p className="text-white/60 text-sm">Religion</p>
                        <p>{capitalizeWords(profile.religion)}</p>
                      </div>
                    </div>
                  )}
                  {profile.caste && (
                    <div className="flex items-center gap-3 text-white/80">
                      <Users className="w-5 h-5" />
                      <div>
                        <p className="text-white/60 text-sm">Caste</p>
                        <p>{capitalizeWords(profile.caste)}</p>
                      </div>
                    </div>
                  )}
                  {profile.motherTongue && (
                    <div className="flex items-center gap-3 text-white/80">
                      <Languages className="w-5 h-5" />
                      <div>
                        <p className="text-white/60 text-sm">Mother Tongue</p>
                        <p>{capitalizeWords(profile.motherTongue)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Education & Career</h2>
                <div className="space-y-3">
                  {profile.education && (
                    <div className="flex items-center gap-3 text-white/80">
                      <GraduationCap className="w-5 h-5" />
                      <div>
                        <p className="text-white/60 text-sm">Education</p>
                        <p>{capitalizeWords(profile.education)}</p>
                      </div>
                    </div>
                  )}
                  {profile.occupation && (
                    <div className="flex items-center gap-3 text-white/80">
                      <Briefcase className="w-5 h-5" />
                      <div>
                        <p className="text-white/60 text-sm">Occupation</p>
                        <p>{capitalizeWords(profile.occupation)}</p>
                      </div>
                    </div>
                  )}
                  {profile.workLocation && (
                    <div className="flex items-center gap-3 text-white/80">
                      <MapPin className="w-5 h-5" />
                      <div>
                        <p className="text-white/60 text-sm">Work Location</p>
                        <p>{capitalizeWords(profile.workLocation)}</p>
                      </div>
                    </div>
                  )}
                  {profile.annualIncome && (
                    <div className="flex items-center gap-3 text-white/80">
                      <Sparkles className="w-5 h-5" />
                      <div>
                        <p className="text-white/60 text-sm">Annual Income</p>
                        <p>{capitalizeWords(profile.annualIncome)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Family Details */}
            {(profile.familyType || profile.familyValues || profile.familyStatus || profile.familyLocation) && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Family Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.familyType && (
                    <div className="flex items-center gap-3 text-white/80">
                      <Home className="w-5 h-5" />
                      <div>
                        <p className="text-white/60 text-sm">Family Type</p>
                        <p>{capitalizeWords(profile.familyType)}</p>
                      </div>
                    </div>
                  )}
                  {profile.familyValues && (
                    <div className="flex items-center gap-3 text-white/80">
                      <Heart className="w-5 h-5" />
                      <div>
                        <p className="text-white/60 text-sm">Family Values</p>
                        <p>{capitalizeWords(profile.familyValues)}</p>
                      </div>
                    </div>
                  )}
                  {profile.familyStatus && (
                    <div className="flex items-center gap-3 text-white/80">
                      <Users className="w-5 h-5" />
                      <div>
                        <p className="text-white/60 text-sm">Family Status</p>
                        <p>{capitalizeWords(profile.familyStatus)}</p>
                      </div>
                    </div>
                  )}
                  {profile.familyLocation && (
                    <div className="flex items-center gap-3 text-white/80">
                      <MapPin className="w-5 h-5" />
                      <div>
                        <p className="text-white/60 text-sm">Family Location</p>
                        <p>{capitalizeWords(profile.familyLocation)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Link
                href={`/messages?userId=${profile.userId}`}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Message
              </Link>
              <Link
                href="/search"
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Back to Search
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showPhotoGallery && profile?.user.photos && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setShowPhotoGallery(false)}
        >
          <div 
            className="relative max-w-5xl w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPhotoGallery(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            {profile.user.photos.length > 1 && (
              <>
                <button
                  onClick={handlePreviousPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Current Photo */}
            <div className="relative w-full h-full flex items-center justify-center">
              {profile.user.photos[selectedPhotoIndex] && (
                <div className="relative max-h-full aspect-[4/3] w-full">
                  <Image
                    src={profile.user.photos[selectedPhotoIndex].url}
                    alt={`${profile.user.firstName} ${profile.user.lastName}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>
              )}
            </div>

            {/* Photo Counter */}
            {profile.user.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full backdrop-blur-sm">
                {selectedPhotoIndex + 1} / {profile.user.photos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 