'use client';

import { useState, useEffect, useCallback } from 'react';
import UserSearch from '@/components/UserSearch';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Filter, X, UserX, MapPin, Briefcase, GraduationCap, Heart, MessageCircle, User as UserIcon, Calendar, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import StaticSearch from '@/components/StaticSearch';
import { convertHeightToStandardFormat, heightToDisplayFormat } from '@/lib/utils';
import { capitalizeWords } from '@/utils/textFormatting';

interface SearchUser {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  age: number;
  height: string | null;
  maritalStatus: string | null;
  religion: string | null;
  caste: string | null;
  motherTongue: string | null;
  education: string | null;
  occupation: string | null;
  annualIncome: string | null;
  workLocation: string | null;
  photos: {
    url: string;
    isProfile: boolean;
    caption?: string;
  }[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  photo: string | null;
}

interface QuickSearchUser {
  id: string;
  firstName: string;
  lastName: string;
  photo: string | null;
}

interface SearchFilters {
  ageMin: string;
  ageMax: string;
  heightMin: string;
  heightMax: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  motherTongue: string;
  education: string;
  occupation: string;
  customOccupation: string;
  workLocation: string;
}

const heightOptions = [
  { value: "", label: "Any" },
  { value: "135", label: "4'5\" (135 cm)" },
  { value: "137", label: "4'6\" (137 cm)" },
  { value: "140", label: "4'7\" (140 cm)" },
  { value: "142", label: "4'8\" (142 cm)" },
  { value: "145", label: "4'9\" (145 cm)" },
  { value: "147", label: "4'10\" (147 cm)" },
  { value: "150", label: "4'11\" (150 cm)" },
  { value: "152", label: "5'0\" (152 cm)" },
  { value: "155", label: "5'1\" (155 cm)" },
  { value: "157", label: "5'2\" (157 cm)" },
  { value: "160", label: "5'3\" (160 cm)" },
  { value: "162", label: "5'4\" (162 cm)" },
  { value: "165", label: "5'5\" (165 cm)" },
  { value: "168", label: "5'6\" (168 cm)" },
  { value: "170", label: "5'7\" (170 cm)" },
  { value: "173", label: "5'8\" (173 cm)" },
  { value: "175", label: "5'9\" (175 cm)" },
  { value: "178", label: "5'10\" (178 cm)" },
  { value: "180", label: "5'11\" (180 cm)" },
  { value: "183", label: "6'0\" (183 cm)" },
  { value: "185", label: "6'1\" (185 cm)" },
  { value: "188", label: "6'2\" (188 cm)" },
  { value: "190", label: "6'3\" (190 cm)" },
  { value: "193", label: "6'4\" (193 cm)" },
  { value: "196", label: "6'5\" (196 cm)" }
];

const maritalStatusOptions = [
  { value: "", label: "Any" },
  { value: "never_married", label: "Never Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "awaiting_divorce", label: "Awaiting Divorce" },
  { value: "separated", label: "Separated" }
];

function SearchPageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profilesLoading, setProfilesLoading] = useState(false); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchParams, setSearchParams] = useState({
    ageMin: '',
    ageMax: '',
    heightMin: '',
    heightMax: '',
    religion: '',
    caste: '',
    motherTongue: '',
    maritalStatus: '',
    education: '',
    occupation: '',
    workLocation: ''
  });
  const [debouncedParams, setDebouncedParams] = useState({...searchParams});
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    perPage: 20
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Debounce search params to prevent frequent API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParams(searchParams);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchParams]);

  // Only trigger search when debounced params change
  useEffect(() => {
    if (isAuthenticated) {
      handleSearch(1);
    }
  }, [debouncedParams, isAuthenticated]);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleSearch = useCallback(async (page = 1) => {
    setProfilesLoading(true);
    try {
      const validParams = Object.entries(debouncedParams).reduce((acc, [key, value]) => {
        if (value && value.trim() !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      setActiveFilters(Object.keys(validParams));

      const queryParams = new URLSearchParams({
        ...validParams,
        page: page.toString()
      });

      const response = await fetch(`/api/search?${queryParams}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setProfilesLoading(false);
    }
  }, [debouncedParams]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    const emptyFilters = {
      ageMin: '',
      ageMax: '',
      heightMin: '',
      heightMax: '',
      religion: '',
      caste: '',
      motherTongue: '',
      maritalStatus: '',
      education: '',
      occupation: '',
      workLocation: ''
    };
    setSearchParams(emptyFilters);
    setDebouncedParams(emptyFilters); // Immediately update debounced params to trigger search
    setActiveFilters([]);
  };

  // Apply filters immediately without waiting for debounce
  const applyFilters = () => {
    setDebouncedParams({...searchParams});
  };

  const handleQuickSearchUserSelect = (user: User) => {
    router.push(`/search/${user.id}`);
  };

  const handleUserClick = (user: SearchUser) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleViewFullProfile = () => {
    if (selectedUser) {
      router.push(`/search/${selectedUser.userId}`);
      setShowProfileModal(false);
    }
  };

  const handleMessage = () => {
    if (selectedUser) {
      router.push(`/messages?userId=${selectedUser.id}`);
      setShowProfileModal(false);
    }
  };

  const handlePhotoClick = (user: SearchUser, photoIndex: number) => {
    setSelectedUser(user);
    setCurrentPhotoIndex(photoIndex);
    setShowPhotoGallery(true);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedUser?.photos) {
      setCurrentPhotoIndex((prev) => 
        prev === selectedUser.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedUser?.photos) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? selectedUser.photos.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <StaticSearch />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Search Profiles</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <div
                key={filter}
                className="bg-purple-600/30 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span className="capitalize">{filter.replace(/([A-Z])/g, ' $1').toLowerCase()}: {searchParams[filter as keyof typeof searchParams]}</span>
                <button
                  onClick={() => {
                    // Update both searchParams and debouncedParams to remove the filter
                    setSearchParams(prev => ({
                      ...prev,
                      [filter]: ''
                    }));
                    // Update debounced params immediately to trigger search
                    setDebouncedParams(prev => ({
                      ...prev,
                      [filter]: ''
                    }));
                  }}
                  className="hover:text-purple-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={clearFilters}
              className="text-purple-200 hover:text-white text-sm flex items-center gap-1"
            >
              Clear all filters
            </button>
          </div>
        )}

        <div className="mt-4">
          <UserSearch onUserSelect={handleQuickSearchUserSelect} />
        </div>

        {showFilters && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Age Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="ageMin"
                    value={searchParams.ageMin}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  />
                  <input
                    type="number"
                    name="ageMax"
                    value={searchParams.ageMax}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Height Range</label>
                <div className="flex gap-2">
                  <select
                    name="heightMin"
                    value={searchParams.heightMin}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white [&>option]:bg-indigo-950 [&>option]:text-white"
                  >
                    <option value="">Min Height</option>
                    {heightOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    name="heightMax"
                    value={searchParams.heightMax}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white [&>option]:bg-indigo-950 [&>option]:text-white"
                  >
                    <option value="">Max Height</option>
                    {heightOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={searchParams.maritalStatus}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white [&>option]:bg-indigo-950 [&>option]:text-white"
                >
                  {maritalStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Religion</label>
                <select
                  name="religion"
                  value={searchParams.religion}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white [&>option]:bg-indigo-950 [&>option]:text-white"
                >
                  <option value="">Any</option>
                  <option value="hindu">Hindu</option>
                  <option value="muslim">Muslim</option>
                  <option value="christian">Christian</option>
                  <option value="sikh">Sikh</option>
                  <option value="buddhist">Buddhist</option>
                  <option value="jain">Jain</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Caste</label>
                <input
                  type="text"
                  name="caste"
                  value={searchParams.caste}
                  onChange={handleFilterChange}
                  placeholder="Enter caste"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Mother Tongue</label>
                <select
                  name="motherTongue"
                  value={searchParams.motherTongue}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white [&>option]:bg-indigo-950 [&>option]:text-white"
                >
                  <option value="">Any</option>
                  <option value="hindi">Hindi</option>
                  <option value="marathi">Marathi</option>
                  <option value="punjabi">Punjabi</option>
                  <option value="bengali">Bengali</option>
                  <option value="gujarati">Gujarati</option>
                  <option value="tamil">Tamil</option>
                  <option value="telugu">Telugu</option>
                  <option value="kannada">Kannada</option>
                  <option value="malayalam">Malayalam</option>
                  <option value="odia">Odia</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Education</label>
                <select
                  name="education"
                  value={searchParams.education}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white [&>option]:bg-indigo-950 [&>option]:text-white"
                >
                  <option value="">Any</option>
                  <option value="high_school">High School</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="phd">PhD</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="occupation" className="block text-sm font-medium text-white">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  id="occupation"
                  value={searchParams.occupation}
                  onChange={handleFilterChange}
                  placeholder="Enter occupation"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="workLocation" className="block text-sm font-medium text-white">Work Location</label>
                <input
                  type="text"
                  name="workLocation"
                  id="workLocation"
                  value={searchParams.workLocation}
                  onChange={handleFilterChange}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-white/80 hover:text-white transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Profiles Section - Only show loading here */}
        <div className="mt-8">
          {profilesLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : users.length > 0 ? (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((user) => (
                <div
                  key={user.id}
                    className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white/15 transition-all cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="aspect-[4/3] relative">
                    {user.photos && user.photos.length > 0 ? (
                        <Image
                          src={user.photos[0].url}
                          alt={`${capitalizeWords(user.firstName)} ${capitalizeWords(user.lastName)}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-purple-900/50 flex items-center justify-center">
                          <UserIcon className="w-12 h-12 text-white/50" />
                        </div>
                      )}

                      {user.photos && user.photos.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePhotoClick(user, 0);
                            }}
                          className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
                          >
                          <ZoomIn className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-white truncate">
                        {capitalizeWords(user.firstName)} {capitalizeWords(user.lastName)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-purple-200 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{user.age} years</span>
                    </div>
                    {user.education && (
                        <div className="flex items-center gap-2 text-sm text-purple-200 mt-1">
                        <GraduationCap className="w-4 h-4" />
                          <span className="truncate">{user.education}</span>
                      </div>
                    )}
                    {user.occupation && (
                        <div className="flex items-center gap-2 text-sm text-purple-200 mt-1">
                        <Briefcase className="w-4 h-4" />
                          <span className="truncate">{user.occupation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handleSearch(pageNumber)}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          pageNumber === pagination.currentPage
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                <UserX className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No profiles found</h3>
              <p className="text-purple-200 max-w-md mx-auto">
                Try adjusting your search filters to find more matches, or check back later as new profiles are added daily.
              </p>
            </div>
          )}
        </div>

          {/* Photo Gallery Modal */}
          {showPhotoGallery && selectedUser && (
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
                {selectedUser.photos && selectedUser.photos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
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
                  {selectedUser.photos && selectedUser.photos[currentPhotoIndex] && (
                    <div className="relative max-h-full aspect-[4/3] w-full">
                      <Image
                        src={selectedUser.photos[currentPhotoIndex].url}
                        alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                        fill
                        className="object-contain"
                        sizes="100vw"
                      />
                    </div>
                  )}
                </div>

                {/* Photo Counter */}
                {selectedUser.photos && selectedUser.photos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full backdrop-blur-sm">
                    {currentPhotoIndex + 1} / {selectedUser.photos.length}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Preview Modal */}
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
                    {selectedUser.photos && selectedUser.photos.length > 0 ? (
                      <Image
                        src={selectedUser.photos[0].url}
                        alt={`${capitalizeWords(selectedUser.firstName)} ${capitalizeWords(selectedUser.lastName)}`}
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
                      {capitalizeWords(selectedUser.firstName)} {capitalizeWords(selectedUser.lastName)}
                    </h3>
                    <p className="text-sm text-white/90">
                      {selectedUser.age} years • {selectedUser.height || 'Height not specified'}
                    </p>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-white/80">
                    {selectedUser.education && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        <div>
                          <p className="text-white/60 text-xs">Education</p>
                          <p className="text-sm">{selectedUser.education}</p>
                        </div>
                      </div>
                    )}
                    {selectedUser.occupation && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <div>
                          <p className="text-white/60 text-xs">Occupation</p>
                          <p className="text-sm">{selectedUser.occupation}</p>
                        </div>
                      </div>
                    )}
                    {selectedUser.workLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <div>
                          <p className="text-white/60 text-xs">Location</p>
                          <p className="text-sm">{selectedUser.workLocation}</p>
                        </div>
                      </div>
                    )}
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
    </div>
  );
}

const SearchPage = SearchPageContent;
export default SearchPage;
