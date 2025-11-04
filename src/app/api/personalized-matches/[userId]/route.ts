import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { Profile, User, Photo } from '@prisma/client';

interface ProfileWithUser extends Profile {
  user: User & {
    photos: Photo[];
  };
}

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
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

    const userId = params.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get current user's AI personalization for comparison
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        aiPersonalization: {
          select: {
            foodPreference: true,
            sleepSchedule: true,
            socialPersonality: true,
            religionSpirituality: true,
            relationshipType: true,
            careerPriority: true,
            childrenPreference: true,
            livingSetup: true,
            relocationFlexibility: true,
            marriageTimeline: true,
            relationshipIntent: true
          }
        }
      }
    });

    // Get profile with user details
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            gender: true,
            dob: true,
            email: true,
            phone: true,
            photos: {
              orderBy: {
                isProfile: 'desc'
              },
              select: {
                url: true,
                isProfile: true
              }
            }
          }
        }
      }
    }) as ProfileWithUser | null;

    // Get AI personalization separately
    const aiPersonalization = await prisma.aIPersonalization.findUnique({
      where: { userId },
      select: {
        foodPreference: true,
        sleepSchedule: true,
        socialPersonality: true,
        religionSpirituality: true,
        relationshipType: true,
        careerPriority: true,
        childrenPreference: true,
        livingSetup: true,
        relocationFlexibility: true,
        marriageTimeline: true,
        relationshipIntent: true
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Ensure user data exists
    if (!profile.user) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 404 }
      );
    }

    // Calculate matching criteria if both users have AI personalization
    let matchingCriteria: string[] = [];
    let matchScore = 0;

    if (currentUser?.aiPersonalization && aiPersonalization) {
      // Helper function to format field values for display
      const formatValue = (value: string) => {
        if (!value) return '';
        return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      };

      const user1 = currentUser.aiPersonalization;
      const user2 = aiPersonalization;

      if (user1.foodPreference === user2.foodPreference && user1.foodPreference) {
        matchingCriteria.push(`Both prefer ${formatValue(user1.foodPreference)} food`);
      }
      if (user1.sleepSchedule === user2.sleepSchedule && user1.sleepSchedule) {
        matchingCriteria.push(`Both are ${formatValue(user1.sleepSchedule)}`);
      }
      if (user1.socialPersonality === user2.socialPersonality && user1.socialPersonality) {
        matchingCriteria.push(`Both are ${formatValue(user1.socialPersonality)}`);
      }
      if (user1.religionSpirituality === user2.religionSpirituality && user1.religionSpirituality) {
        matchingCriteria.push(`Both are ${formatValue(user1.religionSpirituality)}`);
      }
      if (user1.relationshipType === user2.relationshipType && user1.relationshipType) {
        matchingCriteria.push(`Both seek ${formatValue(user1.relationshipType)} relationships`);
      }
      if (user1.careerPriority === user2.careerPriority && user1.careerPriority) {
        matchingCriteria.push(`Both prioritize ${formatValue(user1.careerPriority)}`);
      }
      if (user1.childrenPreference === user2.childrenPreference && user1.childrenPreference) {
        matchingCriteria.push(`Both ${formatValue(user1.childrenPreference)}`);
      }
      if (user1.livingSetup === user2.livingSetup && user1.livingSetup) {
        matchingCriteria.push(`Both prefer ${formatValue(user1.livingSetup)}`);
      }
      if (user1.marriageTimeline === user2.marriageTimeline && user1.marriageTimeline) {
        matchingCriteria.push(`Both want marriage ${formatValue(user1.marriageTimeline)}`);
      }
      if (user1.relationshipIntent === user2.relationshipIntent && user1.relationshipIntent) {
        matchingCriteria.push(`Both want ${formatValue(user1.relationshipIntent)}`);
      }
      if (user1.relocationFlexibility === user2.relocationFlexibility && user1.relocationFlexibility) {
        matchingCriteria.push(`Both are ${formatValue(user1.relocationFlexibility)}`);
      }

      // Calculate match score
      const fields = {
        religionSpirituality: 3,
        relationshipType: 3,
        childrenPreference: 2,
        marriageTimeline: 2,
        relationshipIntent: 2,
        foodPreference: 1,
        sleepSchedule: 1,
        socialPersonality: 1,
        careerPriority: 1,
        livingSetup: 1,
        relocationFlexibility: 1
      };

      let totalScore = 0;
      let totalWeight = 0;

      for (const [field, weight] of Object.entries(fields)) {
        if (user1[field as keyof typeof user1] && user2[field as keyof typeof user2]) {
          const value1 = String(user1[field as keyof typeof user1]).toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_').replace(/[^a-z0-9_]/g, '');
          const value2 = String(user2[field as keyof typeof user2]).toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_').replace(/[^a-z0-9_]/g, '');

          if (value1 === value2) {
            totalScore += weight;
          } else {
            totalScore += weight * 0.25; // Give some points for mismatches
          }
          totalWeight += weight;
        }
      }

      if (totalWeight > 0) {
        matchScore = Math.round((totalScore / totalWeight) * 100);
      }
    }

    return NextResponse.json({
      ...profile,
      matchingCriteria,
      matchScore
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 