const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Common password for all users
const PASSWORD = 'Test@123';

// Mock data arrays
const maleFirstNames = [
  'Aarav', 'Vihaan', 'Arjun', 'Aditya', 'Reyansh',
  'Dhruv', 'Kabir', 'Karthik', 'Rohan', 'Vivaan',
  'Shaurya', 'Ishaan', 'Aryan', 'Dev', 'Yash',
  'Virat', 'Raj', 'Arnav', 'Krishna', 'Pranav',
  'Advait', 'Atharv', 'Ayaan', 'Veer', 'Shivansh'
];

const femaleFirstNames = [
  'Aaradhya', 'Ananya', 'Diya', 'Saanvi', 'Aanya',
  'Pari', 'Anika', 'Navya', 'Riya', 'Avni',
  'Myra', 'Aadhya', 'Ishita', 'Zara', 'Kiara',
  'Sara', 'Prisha', 'Ahana', 'Avisha', 'Shanaya',
  'Anvi', 'Kyra', 'Aditi', 'Mishka', 'Naira'
];

const lastNames = [
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Verma',
  'Gupta', 'Malhotra', 'Kapoor', 'Joshi', 'Chopra',
  'Reddy', 'Nair', 'Shah', 'Mehta', 'Iyer'
];

const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain'];
const castes = ['Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha', 'Rajput', 'Agarwal', 'Maratha', 'Jat'];
const educations = [
  'B.Tech', 'M.Tech', 'MBA', 'MBBS', 'BBA',
  'B.Com', 'M.Com', 'CA', 'PhD', 'B.Arch'
];

const occupations = [
  'Software Engineer', 'Doctor', 'Business Analyst',
  'Chartered Accountant', 'Teacher', 'Architect',
  'Investment Banker', 'Data Scientist', 'Professor',
  'Entrepreneur'
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad',
  'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'
];

const hobbies = [
  'Reading', 'Traveling', 'Photography', 'Cooking',
  'Painting', 'Dancing', 'Singing', 'Playing Guitar',
  'Yoga', 'Fitness'
];

// Helper functions
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateDOB = () => {
  const start = new Date(1988, 0, 1);
  const end = new Date(2000, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateAIPersonalization = () => ({
  isCompleted: true,
  foodPreference: getRandomElement(['Vegetarian', 'Non-Vegetarian', 'Eggetarian']),
  sleepSchedule: getRandomElement(['Early Bird', 'Night Owl', 'Balanced']),
  socialPersonality: getRandomElement(['Extrovert', 'Introvert', 'Ambivert']),
  religionSpirituality: getRandomElement(['Very Religious', 'Moderately Religious', 'Somewhat Religious']),
  relationshipType: getRandomElement(['Traditional', 'Modern', 'Balanced']),
  careerPriority: getRandomElement(['Career Focused', 'Family Focused', 'Work-Life Balance']),
  childrenPreference: getRandomElement(['Want Children', 'Maybe Later', 'Not Sure']),
  livingSetup: getRandomElement(['Joint Family', 'Nuclear Family', 'Independent']),
  relocationFlexibility: getRandomElement(['Flexible', 'Not Flexible', 'Depends on Opportunity']),
  marriageTimeline: getRandomElement(['Within 6 months', 'Within 1 year', 'Within 2 years']),
  relationshipIntent: getRandomElement(['Marriage', 'Long Term Relationship leading to Marriage']),
  personalizedAnswers: {
    favoriteQuote: "Life is what happens while you're busy making other plans",
    dreamVacation: "Exploring new cultures and cuisines around the world",
    lifeGoals: "Building a successful career while maintaining work-life balance"
  },
  profileSummary: {
    personality: "Warm, ambitious, and family-oriented individual",
    lifestyle: "Active and health-conscious lifestyle with a passion for personal growth",
    values: "Strong traditional values with a modern outlook"
  }
});

const generateUser = async (gender, index) => {
  const firstName = gender === 'Male' 
    ? maleFirstNames[index]
    : femaleFirstNames[index];
  const lastName = getRandomElement(lastNames);
  const dob = generateDOB();

  // Create base user
  const user = await prisma.user.create({
    data: {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`,
      password: await bcrypt.hash(PASSWORD, 10),
      firstName,
      lastName,
      gender,
      dob,
      phone: `+91${getRandomInt(7000000000, 9999999999)}`,
      isVerified: true,
      isActive: true,
      lastLogin: new Date(),

      // Create profile
      profile: {
        create: {
          height: `${getRandomInt(150, 190)} cm`,
          weight: `${getRandomInt(50, 85)} kg`,
          maritalStatus: 'Never Married',
          religion: getRandomElement(religions),
          caste: getRandomElement(castes),
          motherTongue: getRandomElement(['Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu']),
          education: getRandomElement(educations),
          occupation: getRandomElement(occupations),
          annualIncome: `${getRandomInt(5, 50)} LPA`,
          workLocation: getRandomElement(cities),
          familyType: getRandomElement(['Nuclear', 'Joint']),
          familyStatus: getRandomElement(['Middle Class', 'Upper Middle Class']),
          aboutMe: "I am a well-educated professional looking for a life partner who shares similar values and aspirations. I believe in the perfect blend of modern thinking and traditional values.",
          hobbies: getRandomElement(hobbies)
        }
      },

      // Create horoscope
      horoscope: {
        create: {
          dateOfBirth: dob,
          timeOfBirth: `${getRandomInt(0, 23)}:${getRandomInt(0, 59)}`,
          placeOfBirth: getRandomElement(cities),
          rashi: getRandomElement(['Mesh', 'Vrishabh', 'Mithun', 'Kark']),
          nakshatra: getRandomElement(['Ashwini', 'Bharani', 'Kritika']),
          manglik: getRandomElement(['Yes', 'No', 'Partial']),
        }
      },

      // Create preferences
      preferences: {
        create: {
          ageFrom: getRandomInt(25, 30),
          ageTo: getRandomInt(31, 35),
          heightFrom: "150 cm",
          heightTo: "180 cm",
          maritalStatus: "Never Married",
          religion: getRandomElement(religions),
          education: getRandomElement(educations),
          occupation: getRandomElement(occupations),
          location: getRandomElement(cities),
        }
      },

      // Create photos
      photos: {
        create: [
          {
            url: `https://randomuser.me/api/portraits/${gender.toLowerCase()}/${index + 1}.jpg`,
            isProfile: true,
            isVerified: true
          },
          {
            url: `https://randomuser.me/api/portraits/${gender.toLowerCase()}/${index + 2}.jpg`,
            isProfile: false,
            isVerified: true
          }
        ]
      },

      // Create AI Personalization
      aiPersonalization: {
        create: generateAIPersonalization()
      }
    }
  });

  return user;
};

const generateAllUsers = async () => {
  try {
    console.log('Starting user generation...');

    // Generate 25 male users
    for (let i = 0; i < 25; i++) {
      await generateUser('Male', i);
      console.log(`Generated male user ${i + 1}/25`);
    }

    // Generate 25 female users
    for (let i = 0; i < 25; i++) {
      await generateUser('Female', i);
      console.log(`Generated female user ${i + 1}/25`);
    }

    console.log('Successfully generated all users!');
  } catch (error) {
    console.error('Error generating users:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Run the script
generateAllUsers(); 