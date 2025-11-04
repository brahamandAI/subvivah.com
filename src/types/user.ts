export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  photos?: { url: string; caption?: string; isProfile?: boolean }[];
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