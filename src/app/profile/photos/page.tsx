'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { Camera, X, ChevronLeft, ChevronRight, Upload, Trash2, Heart } from 'lucide-react';

interface Photo {
  url: string;
  isProfile?: boolean;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  photos?: Photo[];
}

function PhotoGalleryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Set<number>>(new Set());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null);
  };

  const handlePreviousPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null && user?.photos) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + user.photos.length) % user.photos.length);
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null && user?.photos) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % user.photos.length);
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

  const handleDeletePhoto = async (index: number) => {
    if (!user?.photos) return;

    try {
      const response = await fetch('/api/photos/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoUrl: user.photos[index].url,
        }),
      });

      if (response.ok) {
        // Refresh user data
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const data = await userResponse.json();
          setUser(data.user);
        }
        setSelectedPhotoIndex(null);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        handleNextPhoto(e as any);
      } else {
        handlePreviousPhoto(e as any);
      }
    }

    setTouchStart(null);
  };

  const handleLike = (index: number) => {
    setLikedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Swiping logic for main view
  const handleMainTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleMainTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNextMainPhoto();
      } else {
        handlePreviousMainPhoto();
      }
    }
    setTouchStart(null);
  };
  const handlePreviousMainPhoto = () => {
    if (user?.photos) {
      setCurrentPhotoIndex((currentPhotoIndex - 1 + user.photos.length) % user.photos.length);
    }
  };
  const handleNextMainPhoto = () => {
    if (user?.photos) {
      setCurrentPhotoIndex((currentPhotoIndex + 1) % user.photos.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center relative overflow-hidden">
        {/* Blurred overlay */}
        <div className="absolute inset-0 backdrop-blur-md z-0" />
        {/* Professional SVG spinner */}
        <div className="relative z-10 flex flex-col items-center">
          <svg className="animate-spin h-14 w-14 text-purple-300 mb-4" viewBox="0 0 50 50">
            <circle className="opacity-20" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" />
            <circle className="opacity-70" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" strokeDasharray="31.4 94.2" />
          </svg>
          <span className="text-purple-200 text-lg font-medium animate-pulse">Loading photos...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const photos = user.photos || [];
  const currentPhoto = photos[currentPhotoIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 py-10 flex flex-col items-center relative overflow-hidden">
      {/* Decorative floating camera icon */}
      <div className="absolute top-4 right-8 animate-pulse text-amber-200 text-4xl z-10">📸</div>
      <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Modern Left-Aligned Header */}
        <div className="mb-8 flex flex-col gap-2 items-start w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center text-purple-200 hover:text-purple-100 mb-1 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Profile
          </button>
          <div className="flex w-full items-center justify-between">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white">Photo Gallery</h1>
              <p className="text-purple-200 mt-1 text-base">Swipe or use arrows to browse your photos</p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-200 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-400/30 shadow-md"
            >
              <Upload className="w-5 h-5" />
              Upload Photo
            </button>
          </div>
        </div>

        {/* Photo Grid View */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {photos.map((photo, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden shadow-lg bg-white/10 hover:shadow-xl transition-all cursor-pointer flex flex-col border border-purple-400/30 hover:bg-white/20"
                onClick={() => setSelectedPhotoIndex(idx)}
              >
                <div className="relative w-full aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Image
                    src={photo.url}
                    alt={`Photo ${idx + 1}`}
                    fill
                    className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                    sizes="300px"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">No photos uploaded yet.</div>
        )}

        {/* Modal for Full-Size Photo with Swiping and Side Previews */}
        {selectedPhotoIndex !== null && photos.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <div
              className="relative flex flex-col items-center bg-gradient-to-br from-indigo-950/95 via-purple-900/95 to-indigo-950/95 backdrop-blur-lg rounded-2xl shadow-xl p-4 transition-all duration-300 max-w-2xl w-full border border-purple-400/30"
              onClick={e => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{ minHeight: '480px' }}
            >
              {/* Previous Photo Preview */}
              {photos.length > 1 && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-3/4 flex items-center justify-end z-10 pointer-events-none"
                  style={{ filter: 'blur(4px)', opacity: 0.5 }}
                >
                  <div className="relative w-24 h-40 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 shadow-md">
                    <Image
                      src={photos[(selectedPhotoIndex - 1 + photos.length) % photos.length].url}
                      alt="Previous"
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-transparent" />
                  </div>
                </div>
              )}
              {/* Next Photo Preview */}
              {photos.length > 1 && (
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-3/4 flex items-center justify-start z-10 pointer-events-none"
                  style={{ filter: 'blur(4px)', opacity: 0.5 }}
                >
                  <div className="relative w-24 h-40 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 shadow-md">
                    <Image
                      src={photos[(selectedPhotoIndex + 1) % photos.length].url}
                      alt="Next"
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-white/80 to-transparent" />
                  </div>
                </div>
              )}
              {/* Swiping Arrows */}
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-purple-100 text-purple-700 rounded-full p-2 z-20 shadow-md"
                onClick={handlePreviousPhoto}
                aria-label="Previous photo"
                style={{ transition: 'background 0.2s' }}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-purple-100 text-purple-700 rounded-full p-2 z-20 shadow-md"
                onClick={handleNextPhoto}
                aria-label="Next photo"
                style={{ transition: 'background 0.2s' }}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              {/* Big Photo */}
              <div className="w-full aspect-[4/5] max-h-[400px] relative bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-300">
                <Image
                  src={photos[selectedPhotoIndex].url}
                  alt={`Photo ${selectedPhotoIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="400px"
                  priority
                />
              </div>
              {/* Heart Button */}
              <button
                className={`mt-6 mb-2 bg-white/80 rounded-full p-3 shadow-md hover:bg-pink-100 transition-colors ${likedPhotos.has(selectedPhotoIndex) ? 'text-pink-600' : 'text-gray-400'}`}
                onClick={() => handleLike(selectedPhotoIndex)}
                aria-label="Like photo"
              >
                <Heart className={`w-8 h-8 transition-transform ${likedPhotos.has(selectedPhotoIndex) ? 'scale-110 fill-pink-500' : ''}`} fill={likedPhotos.has(selectedPhotoIndex) ? '#ec4899' : 'none'} />
              </button>
              {/* Photo Counter */}
              <div className="mt-2 text-sm text-gray-400">{selectedPhotoIndex + 1} / {photos.length}</div>
              {/* Delete Button */}
              <button
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                onClick={() => handleDeletePhoto(selectedPhotoIndex)}
              >
                <Trash2 className="w-5 h-5" />
                Delete Photo
              </button>
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white/80 rounded-full p-2 z-30"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Upload Modal (unchanged) */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upload Photo</h2>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                      <p className="text-sm text-gray-600">{uploadFile.name}</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to select a photo</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
                {uploadStatus === 'uploading' && (
                  <div className="text-center text-purple-600 my-2">Uploading...</div>
                )}
                {uploadStatus === 'success' && (
                  <div className="text-center text-green-600 my-2">Upload successful!</div>
                )}
                {uploadStatus === 'error' && (
                  <div className="text-center text-red-600 my-2">Upload failed. Please try again.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(PhotoGalleryPage); 