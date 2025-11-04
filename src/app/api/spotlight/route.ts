import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const getAll = searchParams.get('all') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching matches for user:', userId);

    try {
      // Get user's profile first to determine gender
      const userProfile = await prisma.profile.findUnique({
        where: { userId },
        include: { user: true }
      });

      if (!userProfile) {
        console.log('User profile not found for ID:', userId);
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        );
      }

      const userGender = userProfile.user.gender?.toUpperCase();
      console.log('User gender:', userGender);

      // Get user's preferences
      const userPreferences = await prisma.preferences.findUnique({
        where: { userId }
      });

      if (!userPreferences) {
        console.log('User preferences not found for ID:', userId);
        return NextResponse.json(
          { error: 'User preferences not found' },
          { status: 404 }
        );
      }

      console.log('Found user preferences:', userPreferences);

      // Find potential matches with gender filter
      const potentialMatches = await prisma.profile.findMany({
        where: {
          userId: { not: userId }, // Exclude self
          user: {
            gender: {
              equals: userGender === 'MALE' ? 'FEMALE' : 'MALE',
              mode: 'insensitive' // Case-insensitive comparison
            }
          }
        },
        select: {
          id: true,
          userId: true,
          height: true,
          maritalStatus: true,
          religion: true,
          caste: true,
          education: true,
          occupation: true,
          workLocation: true,
          aboutMe: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              dob: true,
              gender: true
            }
          }
        }
      });

      console.log('Found potential matches:', potentialMatches.length);

      if (potentialMatches.length === 0) {
        return NextResponse.json(
          { error: 'No potential matches found' },
          { status: 404 }
        );
      }

      // Calculate match score for each potential match
      const scoredMatches = potentialMatches.map(match => {
        try {
          let score = 0;
          let matchingCriteria = [];

          // Age match (20 points)
          if (userPreferences.ageFrom && userPreferences.ageTo && match.user.dob) {
            const age = new Date().getFullYear() - new Date(match.user.dob).getFullYear();
            if (age >= userPreferences.ageFrom && age <= userPreferences.ageTo) {
              score += 20;
              matchingCriteria.push('Age');
            }
          }

          // Religion match (20 points)
          if (userPreferences.religion && match.religion?.toLowerCase() === userPreferences.religion.toLowerCase()) {
            score += 20;
            matchingCriteria.push('Religion');
          }

          // Education match (15 points)
          if (userPreferences.education && match.education?.toLowerCase() === userPreferences.education.toLowerCase()) {
            score += 15;
            matchingCriteria.push('Education');
          }

          // Height match (15 points)
          if (userPreferences.heightFrom && userPreferences.heightTo && match.height) {
            try {
              const heightInCm = parseInt(match.height);
              const minHeight = parseInt(userPreferences.heightFrom);
              const maxHeight = parseInt(userPreferences.heightTo);
              if (!isNaN(heightInCm) && !isNaN(minHeight) && !isNaN(maxHeight) &&
                  heightInCm >= minHeight && heightInCm <= maxHeight) {
                score += 15;
                matchingCriteria.push('Height');
              }
            } catch (error) {
              console.error('Error parsing height:', error);
            }
          }

          // Location match (15 points)
          if (userPreferences.location && match.workLocation?.toLowerCase() === userPreferences.location.toLowerCase()) {
            score += 15;
            matchingCriteria.push('Location');
          }

          // Occupation match (10 points)
          if (userPreferences.occupation && match.occupation?.toLowerCase() === userPreferences.occupation.toLowerCase()) {
            score += 10;
            matchingCriteria.push('Occupation');
          }

          // Marital status match (5 points)
          if (userPreferences.maritalStatus && match.maritalStatus?.toLowerCase() === userPreferences.maritalStatus.toLowerCase()) {
            score += 5;
            matchingCriteria.push('Marital Status');
          }

          return {
            profile: match,
            matchScore: score,
            matchingCriteria
          };
        } catch (error) {
          console.error('Error scoring match:', error);
          return {
            profile: match,
            matchScore: 0,
            matchingCriteria: []
          };
        }
      });

      // Sort by match score
      const sortedMatches = scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

      if (getAll) {
        // Return all matches
        return NextResponse.json({
          matches: sortedMatches
        });
      } else {
        // Return only the best match
        const bestMatch = sortedMatches[0];

        if (!bestMatch || bestMatch.matchScore < 20) {
          return NextResponse.json(
            { error: 'No suitable matches found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          matchedProfile: bestMatch.profile,
          matchScore: bestMatch.matchScore,
          matchingCriteria: bestMatch.matchingCriteria
        });
      }
    } catch (error) {
      console.error('Database operation error:', error);
      return NextResponse.json(
        { error: 'Database operation failed', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 