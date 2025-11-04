"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  Brain, 
  CheckCircle, 
  Circle, 
  ArrowRight,
  Edit3,
  Camera,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface CompleteProfileSectionProps {
  userProfile: any;
  user: any;
  onProfileUpdate?: () => void;
}

interface SectionStatus {
  completed: boolean;
  progress: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  route: string;
}

const CompleteProfileSection: React.FC<CompleteProfileSectionProps> = ({
  userProfile,
  user,
  onProfileUpdate
}) => {
  const router = useRouter();
  const { language } = useLanguage();
  const [sections, setSections] = useState<SectionStatus[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    calculateProgress();
  }, [userProfile, user]);

  const calculateProgress = () => {
    const basicInfoProgress = calculateBasicInfoProgress();
    const additionalDetailsProgress = calculateAdditionalDetailsProgress();
    const genderVerificationProgress = calculateGenderVerificationProgress();
    const aiPersonalizationProgress = calculateAIPersonalizationProgress();

    setSections([
      {
        completed: basicInfoProgress === 100,
        progress: basicInfoProgress,
        title: "Basic Information",
        description: "Name, DOB, Location, etc.",
        icon: <User className="w-5 h-5" />,
        action: basicInfoProgress === 100 ? "Edit Basic Info" : "Update Basic Info",
        route: "/profile/edit-basic"
      },
      {
        completed: additionalDetailsProgress === 100,
        progress: additionalDetailsProgress,
        title: "Fill Additional Details",
        description: "Income, Family, Education, etc.",
        icon: <Edit3 className="w-5 h-5" />,
        action: additionalDetailsProgress === 100 ? "Edit Details" : "Fill Details",
        route: "/profile/additional-details"
      },
      {
        completed: genderVerificationProgress === 100,
        progress: genderVerificationProgress,
        title: "Verify Gender",
        description: "Face verification for gender confirmation",
        icon: <Camera className="w-5 h-5" />,
        action: genderVerificationProgress === 100 ? "Re-verify" : "Verify Gender",
        route: "/profile/verify-gender"
      },
      {
        completed: aiPersonalizationProgress === 100,
        progress: aiPersonalizationProgress,
        title: "AI Personalization",
        description: "Personality, interests, preferences",
        icon: <Sparkles className="w-5 h-5" />,
        action: aiPersonalizationProgress === 100 ? "Update AI Profile" : "Start AI Personalization",
        route: "/ai-personalization"
      }
    ]);
  };

  const calculateBasicInfoProgress = (): number => {
    if (!user) return 0;
    
    // Basic info fields that should be collected during registration
    const basicFields = [
      'firstName', 'lastName', 'dob', 'gender', 'email'
    ];
    
    const completedFields = basicFields.filter(field => 
      user[field] && user[field].toString().trim() !== ''
    ).length;
    
    return Math.round((completedFields / basicFields.length) * 100);
  };

  const calculateAdditionalDetailsProgress = (): number => {
    if (!userProfile) return 0;
    
    const requiredFields = [
      'height', 'weight', 'maritalStatus', 'religion', 'caste',
      'education', 'occupation', 'annualIncome', 'workLocation',
      'fatherName', 'motherName', 'siblings', 'familyType'
    ];
    
    const completedFields = requiredFields.filter(field => 
      userProfile[field] && userProfile[field].toString().trim() !== ''
    ).length;
    
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const calculateGenderVerificationProgress = (): number => {
    // Check if user has completed face verification
    return user?.isVerified ? 100 : 0;
  };

  const calculateAIPersonalizationProgress = (): number => {
    if (!user?.aiPersonalization) return 0;
    
    // Check if AI personalization is completed
    if (user.aiPersonalization.isCompleted) {
      return 100;
    }
    
    // Check for shard answers (the 11 main questions)
    const shardFields = [
      'foodPreference', 'sleepSchedule', 'socialPersonality', 
      'religionSpirituality', 'relationshipType', 'careerPriority',
      'childrenPreference', 'livingSetup', 'relocationFlexibility',
      'marriageTimeline', 'relationshipIntent'
    ];
    
    const completedShardFields = shardFields.filter(field => 
      user.aiPersonalization[field] && user.aiPersonalization[field].toString().trim() !== ''
    ).length;
    
    // Calculate progress based on shard answers (11 questions)
    const shardProgress = Math.round((completedShardFields / shardFields.length) * 100);
    
    // If shard answers are complete, check for personalized answers and profile summary
    if (shardProgress === 100) {
      const hasPersonalizedAnswers = !!user.aiPersonalization.personalizedAnswers;
      const hasProfileSummary = !!user.aiPersonalization.profileSummary;
      
      if (hasPersonalizedAnswers && hasProfileSummary) {
        return 100;
      } else if (hasPersonalizedAnswers || hasProfileSummary) {
        return 90; // Almost complete
      }
    }
    
    return shardProgress;
  };

  const handleSectionClick = (route: string) => {
    router.push(route);
  };

  const getOverallProgress = (): number => {
    if (sections.length === 0) return 0;
    const totalProgress = sections.reduce((sum, section) => sum + section.progress, 0);
    return Math.round(totalProgress / sections.length);
  };

  const overallProgress = getOverallProgress();

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
          <p className="text-gray-300">Fill in your details to find better matches</p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg text-sm font-medium text-white hover:bg-purple-500/30 transition-colors"
        >
          {isExpanded ? (
            <>
              Show Less
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show More
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className={`space-y-6 transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-[150px] overflow-hidden opacity-90'}`}>
        {sections.map((section, index) => (
          <div key={section.title} className="relative">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-purple-400/30">
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                    <p className="text-gray-400 text-sm">{section.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{section.progress}%</span>
                    {section.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <button
                        onClick={() => router.push(section.route)}
                        className="inline-flex items-center px-4 py-1.5 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg text-sm font-medium text-white hover:bg-purple-500/30 transition-colors"
                      >
                        {section.action}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-purple-500/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${section.progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-400 to-pink-400"
                    />
                  </div>
                </div>
              </div>
            </div>
            {index < sections.length - 1 && (
              <div className="absolute left-6 top-16 bottom-0 w-[1px] bg-purple-400/20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompleteProfileSection; 