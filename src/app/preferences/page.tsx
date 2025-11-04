'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { motion } from 'framer-motion';
import { Heart, GraduationCap, Briefcase, MapPin, DollarSign, Users, Ruler, Calendar } from 'lucide-react';

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

function PreferencesPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<Preferences>({
    ageFrom: null,
    ageTo: null,
    heightFrom: null,
    heightTo: null,
    maritalStatus: null,
    religion: null,
    caste: null,
    education: null,
    occupation: null,
    location: null,
    income: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAndPreferences();
  }, []);

  const fetchUserAndPreferences = async () => {
    try {
      setLoading(true);
      // First get the current user
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        if (typeof window !== 'undefined' && window.showRegisterPopup) {
              window.showRegisterPopup();
            }
        return;
      }
      const userData = await userResponse.json();
      setUserId(userData.user.id);

      // Then fetch preferences
      const preferencesResponse = await fetch(`/api/preferences?userId=${userData.user.id}`);
      if (preferencesResponse.ok) {
        const data = await preferencesResponse.json();
        setPreferences(data);
      } else if (preferencesResponse.status === 404) {
        // If preferences don't exist, that's okay - we'll create them
        console.log('No preferences found - will create new ones');
      } else {
        throw new Error('Failed to fetch preferences');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate age range
    if (preferences.ageFrom && preferences.ageTo && preferences.ageFrom > preferences.ageTo) {
      setError('Age "From" must be less than Age "To"');
      return;
    }

    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...preferences,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preferences');
      }

      setSuccess('Preferences saved successfully!');
      
      // Wait for 2 seconds to show the success message before redirecting
      setTimeout(() => {
        router.push('/matches');
      }, 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError(error instanceof Error ? error.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
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
          <span className="text-purple-200 text-lg font-medium animate-pulse">Loading preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-950/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-500/20">
          <h1 className="text-2xl font-bold text-white mb-6">Partner Preferences</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-white">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-white">{success}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Age Range */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/90 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Age Range</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={preferences.ageFrom || ''}
                    onChange={(e) => setPreferences({ ...preferences, ageFrom: parseInt(e.target.value) || null })}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    placeholder="From"
                  />
                  <input
                    type="number"
                    value={preferences.ageTo || ''}
                    onChange={(e) => setPreferences({ ...preferences, ageTo: parseInt(e.target.value) || null })}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    placeholder="To"
                  />
                </div>
              </div>

              {/* Height Range */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/90 text-sm">
                  <Ruler className="w-4 h-4" />
                  <span>Height Range</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={preferences.heightFrom || ''}
                    onChange={(e) => setPreferences({ ...preferences, heightFrom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    placeholder="From (e.g., 155 cm)"
                  />
                  <input
                    type="text"
                    value={preferences.heightTo || ''}
                    onChange={(e) => setPreferences({ ...preferences, heightTo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    placeholder="To (e.g., 180 cm)"
                  />
                </div>
              </div>
            </div>

            {/* Marital Status */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white/90 text-sm">
                <Heart className="w-4 h-4" />
                <span>Marital Status</span>
              </label>
              <select
                value={preferences.maritalStatus || ''}
                onChange={(e) => setPreferences({ ...preferences, maritalStatus: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="" className="bg-slate-900 text-white">Select marital status</option>
                <option value="never_married" className="bg-slate-900 text-white">Never Married</option>
                <option value="divorced" className="bg-slate-900 text-white">Divorced</option>
                <option value="widowed" className="bg-slate-900 text-white">Widowed</option>
                <option value="awaiting_divorce" className="bg-slate-900 text-white">Awaiting Divorce</option>
              </select>
            </div>

            {/* Religion and Caste */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/90 text-sm">
                  <Users className="w-4 h-4" />
                  <span>Religion</span>
                </label>
                <select
                  value={preferences.religion || ''}
                  onChange={(e) => setPreferences({ ...preferences, religion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="" className="bg-slate-900 text-white">Select Religion</option>
                  <option value="hindu" className="bg-slate-900 text-white">Hindu</option>
                  <option value="muslim" className="bg-slate-900 text-white">Muslim</option>
                  <option value="christian" className="bg-slate-900 text-white">Christian</option>
                  <option value="sikh" className="bg-slate-900 text-white">Sikh</option>
                  <option value="jain" className="bg-slate-900 text-white">Jain</option>
                  <option value="buddhist" className="bg-slate-900 text-white">Buddhist</option>
                  <option value="other" className="bg-slate-900 text-white">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/90 text-sm">
                  <Users className="w-4 h-4" />
                  <span>Caste</span>
                </label>
                <input
                  type="text"
                  value={preferences.caste || ''}
                  onChange={(e) => setPreferences({ ...preferences, caste: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Enter preferred caste"
                />
              </div>
            </div>

            {/* Education and Occupation */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/90 text-sm">
                  <GraduationCap className="w-4 h-4" />
                  <span>Education</span>
                </label>
                <select
                  value={preferences.education || ''}
                  onChange={(e) => setPreferences({ ...preferences, education: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="" className="bg-slate-900 text-white">Select Education</option>
                  <option value="high_school" className="bg-slate-900 text-white">High School</option>
                  <option value="bachelors" className="bg-slate-900 text-white">Bachelor's Degree</option>
                  <option value="masters" className="bg-slate-900 text-white">Master's Degree</option>
                  <option value="phd" className="bg-slate-900 text-white">PhD</option>
                  <option value="other" className="bg-slate-900 text-white">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/90 text-sm">
                  <Briefcase className="w-4 h-4" />
                  <span>Occupation</span>
                </label>
                <input
                  type="text"
                  value={preferences.occupation || ''}
                  onChange={(e) => setPreferences({ ...preferences, occupation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Enter preferred occupation"
                />
              </div>
            </div>

            {/* Location and Income */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/90 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  value={preferences.location || ''}
                  onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Enter preferred location"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/90 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Income</span>
                </label>
                <input
                  type="text"
                  value={preferences.income || ''}
                  onChange={(e) => setPreferences({ ...preferences, income: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Enter minimum income"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

export default withAuth(PreferencesPage); 