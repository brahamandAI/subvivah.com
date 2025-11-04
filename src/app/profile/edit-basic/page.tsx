"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Calendar,
  MapPin,
  Save,
  ArrowLeft
} from 'lucide-react';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { ModernLocationInput } from '@/components/ui/modern-location-input';
import { useLanguage } from '@/context/LanguageContext';

interface BasicInfoForm {
  firstName: string;
  lastName: string;
  dob: string;
  location: string;
}

const EditBasicInfoPage = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [formData, setFormData] = useState<BasicInfoForm>({
    firstName: '',
    lastName: '',
    dob: '',
    location: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          dob: data.user.dob ? new Date(data.user.dob).toISOString().split('T')[0] : '',
          location: data.user.location || ''
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = language === 'hi' ? 'पहला नाम आवश्यक है' : 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = language === 'hi' ? 'अंतिम नाम आवश्यक है' : 'Last name is required';
    }

    if (!formData.dob) {
      newErrors.dob = language === 'hi' ? 'जन्मतिथि आवश्यक है' : 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18 || age > 100) {
        newErrors.dob = language === 'hi' ? 'आयु 18-100 के बीच होनी चाहिए' : 'Age must be between 18-100';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = language === 'hi' ? 'स्थान आवश्यक है' : 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/update-basic-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/profile?message=basic_info_updated');
      } else {
        throw new Error('Failed to update basic info');
      }
    } catch (error) {
      console.error('Error updating basic info:', error);
      setErrors({ submit: language === 'hi' ? 'बेसिक जानकारी अपडेट करने में त्रुटि' : 'Error updating basic info' });
    } finally {
      setIsLoading(false);
    }
  };

  const TEXT = {
    hi: {
      title: 'बेसिक जानकारी संपादित करें',
      subtitle: 'अपनी बुनियादी जानकारी अपडेट करें',
      firstName: 'पहला नाम',
      lastName: 'अंतिम नाम',
      dob: 'जन्मतिथि',
      location: 'स्थान',
      save: 'सहेजें',
      back: 'वापस',
      errors: {
        firstName: 'पहला नाम आवश्यक है',
        lastName: 'अंतिम नाम आवश्यक है',
        dob: 'जन्मतिथि आवश्यक है',
        location: 'स्थान आवश्यक है'
      }
    },
    en: {
      title: 'Edit Basic Information',
      subtitle: 'Update your basic information',
      firstName: 'First Name',
      lastName: 'Last Name',
      dob: 'Date of Birth',
      location: 'Location',
      save: 'Save',
      back: 'Back',
      errors: {
        firstName: 'First name is required',
        lastName: 'Last name is required',
        dob: 'Date of birth is required',
        location: 'Location is required'
      }
    }
  };

  const t = TEXT[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white">{t.title}</h1>
              <p className="text-purple-200">{t.subtitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="space-y-6">
              <ModernInput
                label={t.firstName}
                value={formData.firstName}
                onChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
                icon={<User className="w-5 h-5" />}
                error={errors.firstName}
                variant="glass"
                required
              />

              <ModernInput
                label={t.lastName}
                value={formData.lastName}
                onChange={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
                icon={<User className="w-5 h-5" />}
                error={errors.lastName}
                variant="glass"
                required
              />

              <ModernDatePicker
                label={t.dob}
                value={formData.dob}
                onChange={(value) => setFormData(prev => ({ ...prev, dob: value }))}
                error={errors.dob}
                variant="glass"
                maxDate={new Date(new Date().getFullYear() - 18, 11, 31)}
                minDate={new Date(new Date().getFullYear() - 100, 0, 1)}
                required
              />

              <ModernLocationInput
                label={t.location}
                value={formData.location}
                onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                error={errors.location}
                variant="glass"
                countryFilter="in"
                required
              />
            </div>

            <div className="flex gap-4 mt-8">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                {t.back}
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {t.save}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditBasicInfoPage; 