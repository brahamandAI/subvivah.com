import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verify } from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get the token from the cookie
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const matchedUserId = searchParams.get('matchedUserId');

    if (!userId || !matchedUserId) {
      return NextResponse.json(
        { error: 'Both userId and matchedUserId are required' },
        { status: 400 }
      );
    }

    // Get user preferences
    const userPreferences = await prisma.preferences.findUnique({
      where: { userId }
    });

    if (!userPreferences) {
      return NextResponse.json(
        { error: 'User preferences not found' },
        { status: 404 }
      );
    }

    // Get matched user profile
    const matchedProfile = await prisma.profile.findUnique({
      where: { userId: matchedUserId }
    });

    if (!matchedProfile) {
      return NextResponse.json(
        { error: 'Matched profile not found' },
        { status: 404 }
      );
    }

    // Get matched user's DOB
    const matchedUser = await prisma.user.findUnique({
      where: { id: matchedUserId }
    });

    if (!matchedUser) {
      return NextResponse.json(
        { error: 'Matched user not found' },
        { status: 404 }
      );
    }

    // Calculate match score
    let score = 0;
    const criteria = [];

    // Age match (20 points)
    if (userPreferences.ageFrom && userPreferences.ageTo) {
      const age = calculateAge(matchedUser.dob);
      if (age >= userPreferences.ageFrom && age <= userPreferences.ageTo) {
        score += 20;
        criteria.push({ name: 'Age', score: 20, matched: true });
      } else {
        criteria.push({ name: 'Age', score: 0, matched: false });
      }
    }

    // Religion match (20 points)
    if (userPreferences.religion && matchedProfile.religion) {
      if (userPreferences.religion === matchedProfile.religion) {
        score += 20;
        criteria.push({ name: 'Religion', score: 20, matched: true });
      } else {
        criteria.push({ name: 'Religion', score: 0, matched: false });
      }
    }

    // Education match (15 points)
    if (userPreferences.education && matchedProfile.education) {
      if (userPreferences.education === matchedProfile.education) {
        score += 15;
        criteria.push({ name: 'Education', score: 15, matched: true });
      } else {
        criteria.push({ name: 'Education', score: 0, matched: false });
      }
    }

    // Height match (15 points)
    if (userPreferences.heightFrom && userPreferences.heightTo && matchedProfile.height) {
      const height = parseInt(matchedProfile.height);
      const minHeight = parseInt(userPreferences.heightFrom);
      const maxHeight = parseInt(userPreferences.heightTo);
      if (!isNaN(height) && !isNaN(minHeight) && !isNaN(maxHeight) &&
          height >= minHeight && height <= maxHeight) {
        score += 15;
        criteria.push({ name: 'Height', score: 15, matched: true });
      } else {
        criteria.push({ name: 'Height', score: 0, matched: false });
      }
    }

    // Location match (15 points)
    if (userPreferences.location && matchedProfile.workLocation) {
      if (userPreferences.location === matchedProfile.workLocation) {
        score += 15;
        criteria.push({ name: 'Location', score: 15, matched: true });
      } else {
        criteria.push({ name: 'Location', score: 0, matched: false });
      }
    }

    // Occupation match (10 points)
    if (userPreferences.occupation && matchedProfile.occupation) {
      if (userPreferences.occupation === matchedProfile.occupation) {
        score += 10;
        criteria.push({ name: 'Occupation', score: 10, matched: true });
      } else {
        criteria.push({ name: 'Occupation', score: 0, matched: false });
      }
    }

    // Marital status match (5 points)
    if (userPreferences.maritalStatus && matchedProfile.maritalStatus) {
      if (userPreferences.maritalStatus === matchedProfile.maritalStatus) {
        score += 5;
        criteria.push({ name: 'Marital Status', score: 5, matched: true });
      } else {
        criteria.push({ name: 'Marital Status', score: 0, matched: false });
      }
    }

    return NextResponse.json({
      score,
      criteria,
      profile: matchedProfile
    });
  } catch (error) {
    console.error('Error calculating match details:', error);
    return NextResponse.json(
      { error: 'Failed to calculate match details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
} 