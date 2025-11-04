"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Home, 
  Users, 
  DollarSign,
  MapPin,
  Heart,
  Save,
  ArrowLeft
} from 'lucide-react';
import { ModernInput, ModernSelect } from '@/components/ui/modern-input';
import { useLanguage } from '@/context/LanguageContext';

interface AdditionalDetailsForm {
  // Personal Details
  height: string;
  weight: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  subCaste: string;
  motherTongue: string;
  
  // Education & Career
  education: string;
  occupation: string;
  annualIncome: string;
  workLocation: string;
  
  // Family Details
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  siblings: string;
  familyType: string;
  familyStatus: string;
  
  // Additional Info
  aboutMe: string;
  hobbies: string;
}

const AdditionalDetailsPage = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [formData, setFormData] = useState<AdditionalDetailsForm>({
    height: '',
    weight: '',
    maritalStatus: '',
    religion: '',
    caste: '',
    subCaste: '',
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
    hobbies: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    'personal',
    'education',
    'family',
    'additional',
  ];

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      // First, get the current user ID
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) throw new Error('Failed to fetch user info');
      const userData = await userRes.json();
      const userId = userData?.user?.id;
      if (!userId) throw new Error('User ID not found');

      // Now fetch the profile using the userId
      const response = await fetch(`/api/profile?userId=${userId}`);
      if (response.ok) {
        const profileData = await response.json();
        // Sanitize null/undefined to ''
        const sanitizedData = Object.fromEntries(
          Object.entries(profileData).map(([k, v]) => [k, v == null ? '' : v])
        );
        setFormData(prev => ({
          ...prev,
          ...sanitizedData
        }));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const maritalStatusOptions = [
    { value: 'never_married', label: { hi: 'कभी शादी नहीं हुई', en: 'Never Married' } },
    { value: 'divorced', label: { hi: 'तलाकशुदा', en: 'Divorced' } },
    { value: 'widowed', label: { hi: 'विधवा/विधुर', en: 'Widowed' } },
    { value: 'awaiting_divorce', label: { hi: 'तलाक की प्रक्रिया में', en: 'Awaiting Divorce' } }
  ];

  const educationOptions = [
    { value: 'high_school', label: { hi: 'हाई स्कूल', en: 'High School' } },
    { value: 'bachelors', label: { hi: 'स्नातक', en: 'Bachelor\'s' } },
    { value: 'masters', label: { hi: 'स्नातकोत्तर', en: 'Master\'s' } },
    { value: 'phd', label: { hi: 'पीएचडी', en: 'PhD' } },
    { value: 'diploma', label: { hi: 'डिप्लोमा', en: 'Diploma' } },
    { value: 'other', label: { hi: 'अन्य', en: 'Other' } }
  ];

  const familyTypeOptions = [
    { value: 'nuclear', label: { hi: 'एकल परिवार', en: 'Nuclear Family' } },
    { value: 'joint', label: { hi: 'संयुक्त परिवार', en: 'Joint Family' } },
    { value: 'extended', label: { hi: 'विस्तारित परिवार', en: 'Extended Family' } }
  ];

  const familyStatusOptions = [
    { value: 'middle_class', label: { hi: 'मध्यम वर्ग', en: 'Middle Class' } },
    { value: 'upper_middle_class', label: { hi: 'उच्च मध्यम वर्ग', en: 'Upper Middle Class' } },
    { value: 'upper_class', label: { hi: 'उच्च वर्ग', en: 'Upper Class' } },
    { value: 'lower_middle_class', label: { hi: 'निम्न मध्यम वर्ग', en: 'Lower Middle Class' } }
  ];

  const religionOptions = [
    { value: 'hindu', label: { hi: 'हिंदू', en: 'Hindu' } },
    { value: 'muslim', label: { hi: 'मुस्लिम', en: 'Muslim' } },
    { value: 'christian', label: { hi: 'ईसाई', en: 'Christian' } },
    { value: 'sikh', label: { hi: 'सिख', en: 'Sikh' } },
    { value: 'buddhist', label: { hi: 'बौद्ध', en: 'Buddhist' } },
    { value: 'jain', label: { hi: 'जैन', en: 'Jain' } },
    { value: 'parsi', label: { hi: 'पारसी', en: 'Parsi' } },
    { value: 'jewish', label: { hi: 'यहूदी', en: 'Jewish' } },
    { value: 'other', label: { hi: 'अन्य', en: 'Other' } }
  ];

  const casteOptions = [
    { value: 'brahmin', label: { hi: 'ब्राह्मण', en: 'Brahmin' } },
    { value: 'kshatriya', label: { hi: 'क्षत्रिय', en: 'Kshatriya' } },
    { value: 'vaishya', label: { hi: 'वैश्य', en: 'Vaishya' } },
    { value: 'shudra', label: { hi: 'शूद्र', en: 'Shudra' } },
    { value: 'general', label: { hi: 'सामान्य', en: 'General' } },
    { value: 'obc', label: { hi: 'ओबीसी', en: 'OBC' } },
    { value: 'sc', label: { hi: 'एससी', en: 'SC' } },
    { value: 'st', label: { hi: 'एसटी', en: 'ST' } },
    { value: 'other', label: { hi: 'अन्य', en: 'Other' } }
  ];

  const motherTongueOptions = [
    { value: 'hindi', label: { hi: 'हिंदी', en: 'Hindi' } },
    { value: 'english', label: { hi: 'अंग्रेजी', en: 'English' } },
    { value: 'punjabi', label: { hi: 'पंजाबी', en: 'Punjabi' } },
    { value: 'gujarati', label: { hi: 'गुजराती', en: 'Gujarati' } },
    { value: 'marathi', label: { hi: 'मराठी', en: 'Marathi' } },
    { value: 'bengali', label: { hi: 'बंगाली', en: 'Bengali' } },
    { value: 'tamil', label: { hi: 'तमिल', en: 'Tamil' } },
    { value: 'telugu', label: { hi: 'तेलुगु', en: 'Telugu' } },
    { value: 'kannada', label: { hi: 'कन्नड़', en: 'Kannada' } },
    { value: 'malayalam', label: { hi: 'मलयालम', en: 'Malayalam' } },
    { value: 'urdu', label: { hi: 'उर्दू', en: 'Urdu' } },
    { value: 'sanskrit', label: { hi: 'संस्कृत', en: 'Sanskrit' } },
    { value: 'other', label: { hi: 'अन्य', en: 'Other' } }
  ];

  const occupationOptions = [
    { value: 'software_engineer', label: { hi: 'सॉफ्टवेयर इंजीनियर', en: 'Software Engineer' } },
    { value: 'doctor', label: { hi: 'डॉक्टर', en: 'Doctor' } },
    { value: 'engineer', label: { hi: 'इंजीनियर', en: 'Engineer' } },
    { value: 'teacher', label: { hi: 'शिक्षक', en: 'Teacher' } },
    { value: 'lawyer', label: { hi: 'वकील', en: 'Lawyer' } },
    { value: 'accountant', label: { hi: 'लेखाकार', en: 'Accountant' } },
    { value: 'business_owner', label: { hi: 'व्यवसाय मालिक', en: 'Business Owner' } },
    { value: 'government_employee', label: { hi: 'सरकारी कर्मचारी', en: 'Government Employee' } },
    { value: 'private_employee', label: { hi: 'निजी कर्मचारी', en: 'Private Employee' } },
    { value: 'consultant', label: { hi: 'सलाहकार', en: 'Consultant' } },
    { value: 'entrepreneur', label: { hi: 'उद्यमी', en: 'Entrepreneur' } },
    { value: 'student', label: { hi: 'छात्र', en: 'Student' } },
    { value: 'other', label: { hi: 'अन्य', en: 'Other' } }
  ];

  const annualIncomeOptions = [
    { value: 'below_3_lakh', label: { hi: '3 लाख से कम', en: 'Below 3 Lakh' } },
    { value: '3_to_5_lakh', label: { hi: '3-5 लाख', en: '3-5 Lakh' } },
    { value: '5_to_7_lakh', label: { hi: '5-7 लाख', en: '5-7 Lakh' } },
    { value: '7_to_10_lakh', label: { hi: '7-10 लाख', en: '7-10 Lakh' } },
    { value: '10_to_15_lakh', label: { hi: '10-15 लाख', en: '10-15 Lakh' } },
    { value: '15_to_20_lakh', label: { hi: '15-20 लाख', en: '15-20 Lakh' } },
    { value: '20_to_30_lakh', label: { hi: '20-30 लाख', en: '20-30 Lakh' } },
    { value: '30_to_50_lakh', label: { hi: '30-50 लाख', en: '30-50 Lakh' } },
    { value: 'above_50_lakh', label: { hi: '50 लाख से ऊपर', en: 'Above 50 Lakh' } },
    { value: 'not_disclosed', label: { hi: 'प्रकट नहीं किया', en: 'Not Disclosed' } }
  ];

  const workLocationOptions = [
    { value: 'delhi', label: { hi: 'दिल्ली', en: 'Delhi' } },
    { value: 'mumbai', label: { hi: 'मुंबई', en: 'Mumbai' } },
    { value: 'bangalore', label: { hi: 'बैंगलोर', en: 'Bangalore' } },
    { value: 'hyderabad', label: { hi: 'हैदराबाद', en: 'Hyderabad' } },
    { value: 'chennai', label: { hi: 'चेन्नई', en: 'Chennai' } },
    { value: 'kolkata', label: { hi: 'कोलकाता', en: 'Kolkata' } },
    { value: 'pune', label: { hi: 'पुणे', en: 'Pune' } },
    { value: 'ahmedabad', label: { hi: 'अहमदाबाद', en: 'Ahmedabad' } },
    { value: 'jaipur', label: { hi: 'जयपुर', en: 'Jaipur' } },
    { value: 'lucknow', label: { hi: 'लखनऊ', en: 'Lucknow' } },
    { value: 'kanpur', label: { hi: 'कानपुर', en: 'Kanpur' } },
    { value: 'nagpur', label: { hi: 'नागपुर', en: 'Nagpur' } },
    { value: 'indore', label: { hi: 'इंदौर', en: 'Indore' } },
    { value: 'thane', label: { hi: 'ठाणे', en: 'Thane' } },
    { value: 'bhopal', label: { hi: 'भोपाल', en: 'Bhopal' } },
    { value: 'visakhapatnam', label: { hi: 'विशाखापत्तनम', en: 'Visakhapatnam' } },
    { value: 'patna', label: { hi: 'पटना', en: 'Patna' } },
    { value: 'vadodara', label: { hi: 'वडोदरा', en: 'Vadodara' } },
    { value: 'ghaziabad', label: { hi: 'गाजियाबाद', en: 'Ghaziabad' } },
    { value: 'ludhiana', label: { hi: 'लुधियाना', en: 'Ludhiana' } },
    { value: 'agra', label: { hi: 'आगरा', en: 'Agra' } },
    { value: 'nashik', label: { hi: 'नासिक', en: 'Nashik' } },
    { value: 'faridabad', label: { hi: 'फरीदाबाद', en: 'Faridabad' } },
    { value: 'meerut', label: { hi: 'मेरठ', en: 'Meerut' } },
    { value: 'rajkot', label: { hi: 'राजकोट', en: 'Rajkot' } },
    { value: 'kalyan', label: { hi: 'कल्याण', en: 'Kalyan' } },
    { value: 'vasai', label: { hi: 'वसई', en: 'Vasai' } },
    { value: 'vadodara', label: { hi: 'वडोदरा', en: 'Vadodara' } },
    { value: 'other', label: { hi: 'अन्य', en: 'Other' } }
  ];

  const validateForm = () => {
    // All fields optional, so always return true
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      console.log('Validation errors:', errors);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Sending request to /api/profile/update');
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        // Show success message and redirect
        router.push('/profile?message=details_updated');
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`Failed to update profile: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: language === 'hi' ? 'प्रोफ़ाइल अपडेट करने में त्रुटि' : 'Error updating profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const TEXT = {
    hi: {
      title: 'अतिरिक्त विवरण',
      subtitle: 'अपनी प्रोफ़ाइल को पूरा करें',
      personalDetails: 'व्यक्तिगत विवरण',
      educationCareer: 'शिक्षा और करियर',
      familyDetails: 'पारिवारिक विवरण',
      additionalInfo: 'अतिरिक्त जानकारी',
      save: 'सहेजें',
      back: 'वापस',
      errors: {
        height: 'ऊंचाई आवश्यक है',
        weight: 'वजन आवश्यक है',
        maritalStatus: 'वैवाहिक स्थिति आवश्यक है',
        religion: 'धर्म आवश्यक है',
        caste: 'जाति आवश्यक है',
        motherTongue: 'मातृभाषा आवश्यक है',
        education: 'शिक्षा आवश्यक है',
        occupation: 'व्यवसाय आवश्यक है',
        annualIncome: 'वार्षिक आय आवश्यक है',
        workLocation: 'कार्य स्थान आवश्यक है'
      }
    },
    en: {
      title: 'Additional Details',
      subtitle: 'Complete your profile',
      personalDetails: 'Personal Details',
      educationCareer: 'Education & Career',
      familyDetails: 'Family Details',
      additionalInfo: 'Additional Information',
      save: 'Save',
      back: 'Back',
      errors: {
        height: 'Height is required',
        weight: 'Weight is required',
        maritalStatus: 'Marital status is required',
        religion: 'Religion is required',
        caste: 'Caste is required',
        motherTongue: 'Mother tongue is required',
        education: 'Education is required',
        occupation: 'Occupation is required',
        annualIncome: 'Annual income is required',
        workLocation: 'Work location is required'
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
          className="max-w-4xl mx-auto"
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Stepper Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                className={`px-4 py-2 rounded-lg text-white bg-purple-500/30 hover:bg-purple-500/50 transition-all ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={currentStep === 0}
              >
                &lt;
              </button>
              <div className="text-lg font-semibold text-white">
                {currentStep === 0 && t.personalDetails}
                {currentStep === 1 && t.educationCareer}
                {currentStep === 2 && t.familyDetails}
                {currentStep === 3 && t.additionalInfo}
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}
                className={`px-4 py-2 rounded-lg text-white bg-purple-500/30 hover:bg-purple-500/50 transition-all ${currentStep === steps.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={currentStep === steps.length - 1}
              >
                &gt;
              </button>
            </div>

            {/* Step Content */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">{t.personalDetails}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ModernSelect
                    label={language === 'hi' ? 'ऊंचाई' : 'Height'}
                    value={formData.height}
                    onChange={(value) => setFormData(prev => ({ ...prev, height: value }))}
                    options={[{ value: '', label: 'Select Height' }].concat(
                      Array.from({ length: 100 }, (_, i) => ({
                        value: `${i + 100}`,
                        label: `${i + 100} cm`
                      }))
                    )}
                    error={errors.height}
                    variant="glass"
                  />
                  
                  <ModernSelect
                    label={language === 'hi' ? 'वजन' : 'Weight'}
                    value={formData.weight}
                    onChange={(value) => setFormData(prev => ({ ...prev, weight: value }))}
                    options={[{ value: '', label: 'Select Weight' }].concat(
                      Array.from({ length: 100 }, (_, i) => ({
                        value: `${i + 30}`,
                        label: `${i + 30} kg`
                      }))
                    )}
                    error={errors.weight}
                    variant="glass"
                  />
                  
                  <ModernSelect
                    label={language === 'hi' ? 'वैवाहिक स्थिति' : 'Marital Status'}
                    value={formData.maritalStatus}
                    onChange={(value) => setFormData(prev => ({ ...prev, maritalStatus: value }))}
                    options={maritalStatusOptions.map(option => ({
                      value: option.value,
                      label: option.label[language]
                    }))}
                    error={errors.maritalStatus}
                    variant="glass"
                  />
                  
                  <ModernSelect
                    label={language === 'hi' ? 'धर्म' : 'Religion'}
                    value={formData.religion}
                    onChange={(value) => setFormData(prev => ({ ...prev, religion: value }))}
                    options={religionOptions.map(option => ({
                      value: option.value,
                      label: option.label[language]
                    }))}
                    error={errors.religion}
                    variant="glass"
                  />
                  
                  <ModernSelect
                    label={language === 'hi' ? 'जाति' : 'Caste'}
                    value={formData.caste}
                    onChange={(value) => setFormData(prev => ({ ...prev, caste: value }))}
                    options={casteOptions.map(option => ({
                      value: option.value,
                      label: option.label[language]
                    }))}
                    error={errors.caste}
                    variant="glass"
                  />
                  
                  <ModernInput
                    label={language === 'hi' ? 'उपजाति' : 'Sub Caste'}
                    value={formData.subCaste}
                    onChange={(value) => setFormData(prev => ({ ...prev, subCaste: value }))}
                    variant="glass"
                  />
                  
                  <ModernSelect
                    label={language === 'hi' ? 'मातृभाषा' : 'Mother Tongue'}
                    value={formData.motherTongue}
                    onChange={(value) => setFormData(prev => ({ ...prev, motherTongue: value }))}
                    options={motherTongueOptions.map(option => ({
                      value: option.value,
                      label: option.label[language]
                    }))}
                    error={errors.motherTongue}
                    variant="glass"
                  />
                </div>
              </motion.div>
            )}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">{t.educationCareer}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ModernSelect
                    label={language === 'hi' ? 'शिक्षा' : 'Education'}
                    value={formData.education}
                    onChange={(value) => setFormData(prev => ({ ...prev, education: value }))}
                    options={educationOptions.map(option => ({
                      value: option.value,
                      label: option.label[language]
                    }))}
                    error={errors.education}
                    variant="glass"
                  />
                  
                  <ModernSelect
                    label={language === 'hi' ? 'व्यवसाय' : 'Occupation'}
                    value={formData.occupation}
                    onChange={(value) => setFormData(prev => ({ ...prev, occupation: value }))}
                    options={occupationOptions.map(option => ({
                      value: option.value,
                      label: option.label[language]
                    }))}
                    error={errors.occupation}
                    variant="glass"
                  />
                  
                  <ModernSelect
                    label={language === 'hi' ? 'वार्षिक आय' : 'Annual Income'}
                    value={formData.annualIncome}
                    onChange={(value) => setFormData(prev => ({ ...prev, annualIncome: value }))}
                    options={annualIncomeOptions.map(option => ({
                      value: option.value,
                      label: option.label[language]
                    }))}
                    error={errors.annualIncome}
                    variant="glass"
                  />
                  
                  <ModernSelect
                    label={language === 'hi' ? 'कार्य स्थान' : 'Work Location'}
                    value={formData.workLocation}
                    onChange={(value) => setFormData(prev => ({ ...prev, workLocation: value }))}
                    options={workLocationOptions.map(option => ({
                      value: option.value,
                      label: option.label[language]
                    }))}
                    error={errors.workLocation}
                    variant="glass"
                  />
                </div>
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">{t.familyDetails}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ModernInput
                    label={language === 'hi' ? 'पिता का नाम' : 'Father\'s Name'}
                    value={formData.fatherName}
                    onChange={(value) => setFormData(prev => ({ ...prev, fatherName: value }))}
                    variant="glass"
                  />
                  
                  <ModernInput
                    label={language === 'hi' ? 'पिता का व्यवसाय' : 'Father\'s Occupation'}
                    value={formData.fatherOccupation}
                    onChange={(value) => setFormData(prev => ({ ...prev, fatherOccupation: value }))}
                    variant="glass"
                  />
                  
                  <ModernInput
                    label={language === 'hi' ? 'माता का नाम' : 'Mother\'s Name'}
                    value={formData.motherName}
                    onChange={(value) => setFormData(prev => ({ ...prev, motherName: value }))}
                    variant="glass"
                  />
                  
                  <ModernInput
                    label={language === 'hi' ? 'माता का व्यवसाय' : 'Mother\'s Occupation'}
                    value={formData.motherOccupation}
                    onChange={(value) => setFormData(prev => ({ ...prev, motherOccupation: value }))}
                    variant="glass"
                  />
                  
                  <ModernInput
                    label={language === 'hi' ? 'भाई-बहन' : 'Siblings'}
                    value={formData.siblings}
                    onChange={(value) => setFormData(prev => ({ ...prev, siblings: value }))}
                    placeholder={language === 'hi' ? 'उदाहरण: 2 भाई, 1 बहन' : 'e.g., 2 brothers, 1 sister'}
                    variant="glass"
                  />
                  
                  <ModernSelect
                    label={language === 'hi' ? 'परिवार का प्रकार' : 'Family Type'}
                    value={formData.familyType}
                    onChange={(value) => setFormData(prev => ({ ...prev, familyType: value }))}
                    options={familyTypeOptions.map(option => ({
                      value: option.value,
                      label: option.label[language]
                    }))}
                    variant="glass"
                  />
                  
                  <ModernSelect
                    label={language === 'hi' ? 'परिवार की स्थिति' : 'Family Status'}
                    value={formData.familyStatus}
                    onChange={(value) => setFormData(prev => ({ ...prev, familyStatus: value }))}
                    options={familyStatusOptions.map(option => ({
                      value: option.value,
                      label: option.label[language]
                    }))}
                    variant="glass"
                  />
                </div>
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">{t.additionalInfo}</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {language === 'hi' ? 'मेरे बारे में' : 'About Me'}
                    </label>
                    <textarea
                      value={formData.aboutMe}
                      onChange={(e) => setFormData(prev => ({ ...prev, aboutMe: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder={language === 'hi' ? 'अपने बारे में कुछ लिखें...' : 'Write something about yourself...'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {language === 'hi' ? 'शौक और रुचियां' : 'Hobbies & Interests'}
                    </label>
                    <textarea
                      value={formData.hobbies}
                      onChange={(e) => setFormData(prev => ({ ...prev, hobbies: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder={language === 'hi' ? 'अपने शौक और रुचियां लिखें...' : 'Write your hobbies and interests...'}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button only on last step */}
            {currentStep === steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4"
              >
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
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdditionalDetailsPage; 