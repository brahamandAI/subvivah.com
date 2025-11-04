import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

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

    // Verify token
    let decoded: any;
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    console.log('🔵 Fetching personalized matches for user:', userId);

    // Get current user's personalization data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        gender: true,
        photos: true,
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
            relationshipIntent: true,
            isCompleted: true
          }
        }
      }
    });

    console.log('🔵 Current user AI personalization:', currentUser?.aiPersonalization);

    if (!currentUser?.aiPersonalization?.isCompleted) {
      console.log('❌ User has not completed AI personalization');
      return NextResponse.json(
        { error: 'Personalization not completed' },
        { status: 400 }
      );
    }

    // Get potential matches
    const potentialMatches = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { isActive: true },
          { isVerified: true },
          { gender: currentUser.gender === 'Male' ? 'Female' : 'Male' }, // Filter by opposite gender
          {
            aiPersonalization: {
              isCompleted: true
            }
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        gender: true,
        photos: true,
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
      },
      take: 100 // Limit initial fetch to 100 profiles
    });

    console.log('🔵 Found potential matches:', potentialMatches.length);

    // Calculate matches
    const matchesWithScores = potentialMatches
      .filter(match => match.aiPersonalization) // Ensure aiPersonalization exists
      .map(match => {
        const matchScore = calculateMatchScore(
          currentUser.aiPersonalization!,
          match.aiPersonalization!
        );

        const matchingCriteria = getMatchingCriteria(
          currentUser.aiPersonalization!,
          match.aiPersonalization!
        );

        return {
          id: match.id,
          user: {
            firstName: match.firstName,
            lastName: match.lastName,
            gender: match.gender,
            photos: match.photos || []
          },
          matchScore,
          matchingCriteria
        };
      });

    console.log('🔵 Matches with scores:', matchesWithScores.map(m => ({ id: m.id, score: m.matchScore })));

    // Show ALL matches, sorted by score (best matches first)
    let matches = matchesWithScores
      .sort((a, b) => b.matchScore - a.matchScore);

    console.log('🔵 Final filtered matches:', matches.length);

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching personalized matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function normalizeValue(value: string): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function calculateMatchScore(user1: any, user2: any): number {
  let totalScore = 0;
  let totalWeight = 0;

  // Simplified weights - focus on key compatibility factors
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

  for (const [field, weight] of Object.entries(fields)) {
    if (user1[field] && user2[field]) {
      const value1 = normalizeValue(user1[field]);
      const value2 = normalizeValue(user2[field]);

      console.log(`Comparing ${field}:`, { value1, value2, weight });

      if (value1 === value2) {
        totalScore += weight;
        console.log(`✅ Exact match on ${field}, adding ${weight} points`);
      } else if (areCompatibleAnswers(field, value1, value2)) {
        totalScore += weight * 0.75; // Increased from 0.5 to 0.75 for compatible answers
        console.log(`✅ Compatible match on ${field}, adding ${weight * 0.75} points`);
      } else {
        // Give some points even for mismatches to avoid too many zeros
        totalScore += weight * 0.25;
        console.log(`⚠️ Mismatch on ${field}, adding ${weight * 0.25} points`);
      }
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) {
    console.log('❌ No matching fields found');
    return 0;
  }
  
  const finalScore = Math.round((totalScore / totalWeight) * 100);
  console.log(`Final score: ${finalScore}% (${totalScore}/${totalWeight})`);
  return finalScore;
}

function getMatchingCriteria(user1: any, user2: any): string[] {
  const criteria: string[] = [];
  
  // Helper function to format field values for display
  const formatValue = (value: string) => {
    if (!value) return '';
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (user1.foodPreference === user2.foodPreference && user1.foodPreference) {
    criteria.push(`Both prefer ${formatValue(user1.foodPreference)} food`);
  }
  if (user1.sleepSchedule === user2.sleepSchedule && user1.sleepSchedule) {
    criteria.push(`Both are ${formatValue(user1.sleepSchedule)}`);
  }
  if (user1.socialPersonality === user2.socialPersonality && user1.socialPersonality) {
    criteria.push(`Both are ${formatValue(user1.socialPersonality)}`);
  }
  if (user1.religionSpirituality === user2.religionSpirituality && user1.religionSpirituality) {
    criteria.push(`Both are ${formatValue(user1.religionSpirituality)}`);
  }
  if (user1.relationshipType === user2.relationshipType && user1.relationshipType) {
    criteria.push(`Both seek ${formatValue(user1.relationshipType)} relationships`);
  }
  if (user1.careerPriority === user2.careerPriority && user1.careerPriority) {
    criteria.push(`Both prioritize ${formatValue(user1.careerPriority)}`);
  }
  if (user1.childrenPreference === user2.childrenPreference && user1.childrenPreference) {
    criteria.push(`Both ${formatValue(user1.childrenPreference)}`);
  }
  if (user1.livingSetup === user2.livingSetup && user1.livingSetup) {
    criteria.push(`Both prefer ${formatValue(user1.livingSetup)}`);
  }
  if (user1.marriageTimeline === user2.marriageTimeline && user1.marriageTimeline) {
    criteria.push(`Both want marriage ${formatValue(user1.marriageTimeline)}`);
  }
  if (user1.relationshipIntent === user2.relationshipIntent && user1.relationshipIntent) {
    criteria.push(`Both want ${formatValue(user1.relationshipIntent)}`);
  }
  if (user1.relocationFlexibility === user2.relocationFlexibility && user1.relocationFlexibility) {
    criteria.push(`Both are ${formatValue(user1.relocationFlexibility)}`);
  }

  return criteria;
}

function areCompatibleAnswers(field: string, value1: string, value2: string): boolean {
  // Enhanced compatibility rules
  const compatibilityRules: Record<string, string[][]> = {
    socialPersonality: [
      ['extrovert', 'ambivert'],
      ['introvert', 'ambivert']
    ],
    foodPreference: [
      ['vegetarian', 'eggetarian'],
      ['non_vegetarian', 'eggetarian']
    ],
    sleepSchedule: [
      ['early_bird', 'balanced'],
      ['night_owl', 'balanced']
    ],
    religionSpirituality: [
      ['moderately_religious', 'somewhat_religious'],
      ['moderately_religious', 'very_religious'],
      ['somewhat_religious', 'very_religious']
    ],
    marriageTimeline: [
      ['within_6_months', 'within_1_year'],
      ['within_1_year', 'within_2_years']
    ],
    relationshipType: [
      ['traditional', 'balanced'],
      ['modern', 'balanced']
    ],
    careerPriority: [
      ['career_focused', 'work_life_balance'],
      ['family_focused', 'work_life_balance']
    ],
    childrenPreference: [
      ['want_children', 'maybe_later'],
      ['maybe_later', 'not_sure']
    ],
    livingSetup: [
      ['joint_family', 'nuclear_family'],
      ['nuclear_family', 'independent']
    ],
    relocationFlexibility: [
      ['flexible', 'depends_on_opportunity'],
      ['not_flexible', 'depends_on_opportunity']
    ]
  };

  // If no specific compatibility rule exists, return false
  if (!compatibilityRules[field]) {
    return false;
  }

  // Check if the combination exists in compatibility rules
  return compatibilityRules[field].some(
    ([a, b]) => (value1 === a && value2 === b) || (value1 === b && value2 === a)
  );
} 