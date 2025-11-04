'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import Image from 'next/image';
import PhotoUpload from '@/components/PhotoUpload';
import { Camera, X, Wand2 } from 'lucide-react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { capitalizeWords } from '@/utils/textFormatting';
import CompleteProfileSection from '@/components/CompleteProfileSection';

// Dynamically import FaceVerification with no SSR
const FaceVerificationNoSSR = dynamicImport(() => import('@/components/FaceVerification'), {
  ssr: false
});

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  isVerified: boolean;
  photos?: { url: string; isProfile?: boolean }[];
  profile?: {
    height?: number;
    weight?: number;
    maritalStatus?: string;
    religion?: string;
    caste?: string;
    motherTongue?: string;
    education?: string;
    occupation?: string;
    annualIncome?: number;
    workLocation?: string;
    fatherName?: string;
    fatherOccupation?: string;
    motherName?: string;
    motherOccupation?: string;
    siblings?: number;
    familyType?: string;
    familyStatus?: string;
    aboutMe?: string;
    hobbies?: string[];
  };
}

function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    maritalStatus: '',
    religion: '',
    caste: '',
    motherTongue: '',
    education: '',
    occupation: '',
    annualIncome: '',
    workLocation: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    siblings: '',
    familyType: '',
    familyStatus: '',
    aboutMe: '',
    hobbies: '',
  });
  const router = useRouter();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string } | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          // Parse hobbies from JSON string if it exists
          if (data.user.profile?.hobbies) {
            try {
              data.user.profile.hobbies = JSON.parse(data.user.profile.hobbies);
            } catch (e) {
              data.user.profile.hobbies = [];
            }
          }
          setUser(data.user);
          if (data.user.profile) {
            setFormData({
              height: data.user.profile.height || '',
              weight: data.user.profile.weight || '',
              maritalStatus: data.user.profile.maritalStatus || '',
              religion: data.user.profile.religion || '',
              caste: data.user.profile.caste || '',
              motherTongue: data.user.profile.motherTongue || '',
              education: data.user.profile.education || '',
              occupation: data.user.profile.occupation || '',
              annualIncome: data.user.profile.annualIncome || '',
              workLocation: data.user.profile.workLocation || '',
              fatherName: data.user.profile.fatherName || '',
              fatherOccupation: data.user.profile.fatherOccupation || '',
              motherName: data.user.profile.motherName || '',
              motherOccupation: data.user.profile.motherOccupation || '',
              siblings: data.user.profile.siblings || '',
              familyType: data.user.profile.familyType || '',
              familyStatus: data.user.profile.familyStatus || '',
              aboutMe: data.user.profile.aboutMe || '',
              hobbies: Array.isArray(data.user.profile.hobbies) ? data.user.profile.hobbies.join(', ') : '',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    // Toggle body class for hiding navbar when modal is open
    if (isEditing) {
      document.body.classList.add('edit-profile-modal-open');
    } else {
      document.body.classList.remove('edit-profile-modal-open');
    }
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('edit-profile-modal-open');
    };
  }, [isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert hobbies string to array and then to JSON string for database storage
      const formDataToSubmit = {
        ...formData,
        hobbies: formData.hobbies ? JSON.stringify(formData.hobbies.split(',').map(hobby => hobby.trim()).filter(Boolean)) : null,
      };

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          ...formDataToSubmit,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        // Parse hobbies back to array for UI
        if (updatedProfile.hobbies) {
          updatedProfile.hobbies = JSON.parse(updatedProfile.hobbies);
        }
        setUser(prev => prev ? { ...prev, profile: updatedProfile } : null);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating the profile.');
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user?.email }),
      });

      if (response.ok) {
        alert('Verification email sent! Please check your inbox.');
      } else {
        alert('Failed to send verification email.');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('An error occurred while sending the verification email.');
    }
  };

  const handlePhotoUpload = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Parse hobbies from JSON string if it exists
        if (data.user.profile?.hobbies) {
          try {
            data.user.profile.hobbies = JSON.parse(data.user.profile.hobbies);
          } catch (e) {
            data.user.profile.hobbies = [];
          }
        }
        setUser(data.user);
      } else {
        console.error('Failed to refresh user data');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadStatus('uploading');
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setUploadStatus('success');
        // Refresh user data to get the new photo
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const data = await userResponse.json();
          setUser(data.user);
        }
        setIsUploadModalOpen(false);
        setUploadFile(null);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      setUploadStatus('error');
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  const generateAIBio = async () => {
    try {
      setIsGeneratingBio(true);
      const response = await fetch('/api/generate-bio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          hobbies: user?.profile?.hobbies || [],
          education: user?.profile?.education,
          occupation: user?.profile?.occupation,
          maritalStatus: user?.profile?.maritalStatus,
          religion: user?.profile?.religion,
          workLocation: user?.profile?.workLocation,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          aboutMe: data.bio
        }));

        // If not in edit mode, also update the user profile
        if (!isEditing) {
          const updateResponse = await fetch('/api/profile/update', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user?.id,
              aboutMe: data.bio,
            }),
          });

          if (updateResponse.ok) {
            const updatedProfile = await updateResponse.json();
            setUser(prev => prev ? { ...prev, profile: { ...prev.profile, aboutMe: data.bio } } : null);
          }
        }
      } else {
        throw new Error('Failed to generate bio');
      }
    } catch (error) {
      console.error('Error generating bio:', error);
      alert('Failed to generate bio. Please try again.');
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleVerificationComplete = async (data: any) => {
    console.log('Verification completed:', data);
    
    if (data.success && data.gender) {
      try {
        // Update user's gender in the database
        const response = await fetch('/api/auth/update-gender', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gender: data.gender,
            confidence: data.confidence
          }),
        });

        if (response.ok) {
          // Refresh user data after updating gender
          const userResponse = await fetch('/api/auth/me');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData.user);
          }
          console.log('✅ Gender updated and user data refreshed');
        } else {
          console.error('Failed to update gender in database');
        }
      } catch (error) {
        console.error('Error updating gender:', error);
      }
    }
    
    setShowFaceVerification(false);
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
          <span className="text-purple-200 text-lg font-medium animate-pulse">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const profilePhoto = user?.photos?.find(photo => photo.isProfile) || user?.photos?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 py-8 relative overflow-hidden">
      {/* Decorative floating user icon */}
      <div className="absolute top-4 right-8 animate-pulse text-amber-200 text-4xl z-10">👤</div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Complete Profile Section */}
        <CompleteProfileSection 
          userProfile={user?.profile}
          user={user}
          onProfileUpdate={() => {
            // Refresh user data when profile is updated
            const fetchUser = async () => {
              try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                  const data = await response.json();
                  if (data.user.profile?.hobbies) {
                    try {
                      data.user.profile.hobbies = JSON.parse(data.user.profile.hobbies);
                    } catch (e) {
                      data.user.profile.hobbies = [];
                    }
                  }
                  setUser(data.user);
                }
              } catch (error) {
                console.error('Error fetching user:', error);
              }
            };
            fetchUser();
          }}
        />

        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10 hover:bg-white/10 transition-colors">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Image Section */}
            <div className="flex-shrink-0 relative">
              <div className="relative group">
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-purple-400/20 shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => {
                    if (profilePhoto) {
                      setSelectedPhoto({ url: profilePhoto.url });
                      setIsPhotoModalOpen(true);
                    }
                  }}
                >
                  {profilePhoto ? (
                    <Image
                      src={profilePhoto.url}
                      alt={`${capitalizeWords(user.firstName)}'s profile`}
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center">
                      <span className="text-4xl md:text-5xl font-bold text-white/70">
                        {capitalizeWords(user.firstName)[0]}{capitalizeWords(user.lastName)[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Camera Icon */}
                <div className="absolute bottom-2 right-2 bg-purple-500/20 backdrop-blur-sm rounded-full p-2 shadow-md cursor-pointer hover:bg-purple-500/30 transition-colors border border-purple-400/30">
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Camera className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </label>
                  <input
                    type="file"
                    id="photo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadFile(file);
                        setUploading(true);
                        setUploadStatus('uploading');
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('isProfile', 'true');
                          const response = await fetch('/api/photos/upload', {
                            method: 'POST',
                            body: formData,
                          });
                          
                          if (response.ok) {
                            setUploadStatus('success');
                            // Refresh user data to get the new photo
                            const userResponse = await fetch('/api/auth/me');
                            if (userResponse.ok) {
                              const userData = await userResponse.json();
                              setUser(userData.user);
                            }
                          } else {
                            setUploadStatus('error');
                            const data = await response.json();
                            alert(data.error || 'Failed to upload photo. Please try again.');
                          }
                        } catch (error) {
                          setUploadStatus('error');
                          console.error('Error uploading photo:', error);
                          alert('An error occurred while uploading the photo. Please try again.');
                        } finally {
                          setUploading(false);
                          setUploadFile(null);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="flex-1">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {capitalizeWords(user.firstName)} {capitalizeWords(user.lastName)}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1.5 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg text-sm font-medium text-white hover:bg-purple-500/30 transition-colors w-fit"
                  >
                    Edit Profile
                  </button>
                </div>
                <p className="text-gray-300">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  {user.profile?.maritalStatus && (
                    <span className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-xs font-semibold border border-purple-400/30">
                      {user.profile.maritalStatus}
                    </span>
                  )}
                  {user.profile?.religion && (
                    <span className="bg-pink-500/20 text-pink-200 px-3 py-1 rounded-full text-xs font-semibold border border-pink-400/30">
                      {user.profile.religion}
                    </span>
                  )}
                  {user.profile?.education && (
                    <span className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-xs font-semibold border border-blue-400/30">
                      {user.profile.education}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* About Me */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-icons text-purple-300">person</span>
                <span className="font-semibold text-white">About Me</span>
              </div>
              <button
                onClick={generateAIBio}
                disabled={isGeneratingBio}
                className="px-3 py-1.5 bg-purple-500/20 text-purple-200 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors border border-purple-400/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Wand2 className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                {isGeneratingBio ? 'Generating...' : user.profile?.aboutMe ? 'Regenerate Bio' : 'Generate Bio'}
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm md:text-base leading-relaxed tracking-wide">
                {user.profile?.aboutMe || 
                  <span className="text-gray-400">
                    Tell others about yourself by generating an AI-powered bio. Our AI will create a personalized description highlighting your education, career, interests, and what you're looking for in a partner.
                    <br/><br/>
                    Click the "Generate Bio" button above to get started!
                  </span>
                }
              </p>
            </div>
            </div>

            {/* Photo Gallery */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-icons text-purple-300">photo_camera</span>
                <span className="font-semibold text-white">Photo Gallery</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-3 py-1.5 bg-purple-500/20 text-white rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors flex items-center gap-1.5 border border-purple-400/30"
                >
                  <Camera className="w-4 h-4" />
                  Add Photo
                </button>
                <button 
                  onClick={() => router.push('/profile/photos')}
                  className="px-3 py-1.5 bg-purple-500/20 text-purple-200 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors border border-purple-400/30"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {user?.photos?.slice(0, 3).map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden relative group border border-purple-400/30">
                  <Image
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {(!user?.photos || user.photos.length < 3) && (
                <div 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="aspect-square rounded-lg border-2 border-dashed border-purple-400/30 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-500/20 transition-colors"
                >
                  <Camera className="w-6 h-6 text-purple-300 mb-1" />
                  <span className="text-purple-200 text-sm">Add Photo</span>
                </div>
              )}
            </div>
          </div>

            {/* Interests & Hobbies */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white/10 hover:bg-white/10 transition-colors lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-icons text-purple-300">favorite</span>
              <span className="font-semibold text-white">Interests & Hobbies</span>
              </div>
            <div className="flex flex-wrap gap-2">
                {user.profile?.hobbies && Array.isArray(user.profile.hobbies) && user.profile.hobbies.length > 0 ? (
                  user.profile.hobbies.map((hobby, idx) => (
                    <span key={idx} className={
                      `px-3 py-1 rounded-full text-xs font-medium border ` +
                    (idx % 4 === 0 ? 'bg-red-500/20 text-red-200 border-red-400/30' :
                     idx % 4 === 1 ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30' :
                     idx % 4 === 2 ? 'bg-green-500/20 text-green-200 border-green-400/30' :
                                     'bg-blue-500/20 text-blue-200 border-blue-400/30')
                    }>{hobby}</span>
                  ))
                ) : (
                <span className="text-gray-400 text-sm">No hobbies added yet.</span>
                )}
            </div>
          </div>
        </div>

        {/* Edit Form Modal */}
        {isEditing && (
          <div className="edit-profile-modal fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-950/95 via-purple-900/95 to-slate-950/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 w-full max-w-xl relative max-h-[90vh] overflow-y-auto border border-purple-400/30">
              {/* Enhanced close button */}
              <button
                className="close-btn absolute top-6 left-6 p-3 rounded-full bg-purple-600 hover:bg-purple-700 transition-all duration-300 transform hover:scale-110 shadow-lg border-2 border-purple-400/30 group z-50"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Title */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-purple-100">Edit Your Profile</h2>
                  <p className="text-purple-200/70 mt-1">Update your personal information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information Form */}
                  <div className="space-y-6">
                    <div className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
                      <h2 className="text-lg font-semibold text-purple-100 mb-4">
                        Personal Information
                      </h2>
                  <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Height (cm)</label>
                          <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Enter your height"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Weight (kg)</label>
                          <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Enter your weight"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Marital Status</label>
                          <select
                            name="maritalStatus"
                            value={formData.maritalStatus}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                          >
                            <option value="">Select</option>
                            <option value="Never Married">Never Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                            <option value="Awaiting Divorce">Awaiting Divorce</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Religion</label>
                          <input
                            type="text"
                            name="religion"
                            value={formData.religion}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Enter your religion"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Caste</label>
                          <input
                            type="text"
                            name="caste"
                            value={formData.caste}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Enter your caste"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
                      <h2 className="text-lg font-semibold text-purple-100 mb-4">
                        Family Information
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Father's Name</label>
                          <input
                            type="text"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Enter your father's name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Father's Occupation</label>
                          <input
                            type="text"
                            name="fatherOccupation"
                            value={formData.fatherOccupation}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Enter your father's occupation"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Mother's Name</label>
                          <input
                            type="text"
                            name="motherName"
                            value={formData.motherName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Enter your mother's name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Mother's Occupation</label>
                          <input
                            type="text"
                            name="motherOccupation"
                            value={formData.motherOccupation}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Enter your mother's occupation"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
                      <h2 className="text-lg font-semibold text-purple-100 mb-4">
                        Professional Information
                      </h2>
                  <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Education</label>
                          <input
                            type="text"
                            name="education"
                            value={formData.education}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Enter your education"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Occupation</label>
                          <input
                            type="text"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Enter your occupation"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Annual Income</label>
                          <input
                            type="number"
                            name="annualIncome"
                            value={formData.annualIncome}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Enter your annual income"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-1.5">Work Location</label>
                          <input
                            type="text"
                            name="workLocation"
                            value={formData.workLocation}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Enter your work location"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
                      <h2 className="text-lg font-semibold text-purple-100 mb-4">
                        About Me
                      </h2>
                      <textarea
                        name="aboutMe"
                        value={formData.aboutMe}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20 shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
                      <h2 className="text-lg font-semibold text-purple-100 mb-4">
                        Hobbies & Interests
                      </h2>
                      <input
                        type="text"
                        name="hobbies"
                        value={formData.hobbies}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-lg bg-slate-900/50 border-purple-500/30 text-purple-100 placeholder-purple-300/30 shadow-inner focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 transition-all duration-200"
                        placeholder="Enter hobbies separated by commas"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-purple-500/20">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 text-sm font-medium text-purple-200 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-all duration-300 border border-purple-400/30 hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Profile Photo Modal */}
      {isPhotoModalOpen && selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 z-10"
              onClick={() => setIsPhotoModalOpen(false)}
            >
                <X className="w-6 h-6" />
            </button>
            <Image
              src={selectedPhoto.url}
              alt="Full Profile Photo"
              width={600}
              height={600}
              className="rounded-2xl object-contain max-h-[80vh] max-w-full"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gradient-to-br from-slate-950/95 via-purple-900/95 to-slate-950/95 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-purple-400/30">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-purple-100">Upload Photo</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                  className="text-purple-200 hover:text-purple-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
                <div className="border-2 border-dashed border-purple-400/30 rounded-lg p-6 text-center bg-slate-900/30">
                {uploadFile ? (
                  <div className="space-y-2">
                    <div className="relative w-[200px] h-[200px] mx-auto">
                      <Image
                        src={URL.createObjectURL(uploadFile)}
                        alt="Preview"
                        fill
                        className="rounded-lg object-cover"
                        sizes="200px"
                      />
                    </div>
                      <p className="text-sm text-purple-200">{uploadFile.name}</p>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                      <Camera className="w-12 h-12 text-purple-300 mx-auto mb-2" />
                      <p className="text-purple-200">Click to select a photo</p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              {uploadStatus === 'uploading' && (
                  <div className="text-center text-purple-300 my-2">Uploading...</div>
              )}
              {uploadStatus === 'success' && (
                  <div className="text-center text-green-400 my-2">Upload successful!</div>
              )}
              {uploadStatus === 'error' && (
                  <div className="text-center text-red-400 my-2">Upload failed. Please try again.</div>
              )}

              <button
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                  className="w-full py-2.5 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Face Verification Overlay */}
      {showFaceVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFaceVerification(false)} />
          <div className="relative z-10 w-full max-w-2xl">
            <FaceVerificationNoSSR
              onNext={handleVerificationComplete}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default withAuth(ProfilePage); 