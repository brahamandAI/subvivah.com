import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Get user's preferences
      const userPreferences = await prisma.preferences.findUnique({
        where: { userId }
      });

      if (!userPreferences) {
        return new NextResponse(
          JSON.stringify({ error: 'User preferences not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Get user's profile
      const userProfile = await prisma.profile.findUnique({
        where: { userId },
        include: {
          user: true
        }
      });

      if (!userProfile) {
        return new NextResponse(
          JSON.stringify({ error: 'User profile not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Build match query based on preferences
      const whereClause = {
        AND: [
          { userId: { not: userId } }, // Exclude self
          { user: { gender: { not: userProfile.user.gender } } }, // Match opposite gender
          userPreferences.ageFrom && userPreferences.ageTo ? {
            user: {
              dob: {
                lte: new Date(new Date().setFullYear(new Date().getFullYear() - userPreferences.ageFrom)),
                gte: new Date(new Date().setFullYear(new Date().getFullYear() - userPreferences.ageTo))
              }
            }
          } : {},
          userPreferences.heightFrom && userPreferences.heightTo ? {
            height: {
              gte: userPreferences.heightFrom,
              lte: userPreferences.heightTo
            }
          } : {},
          userPreferences.maritalStatus ? {
            maritalStatus: userPreferences.maritalStatus
          } : {},
          userPreferences.religion ? {
            religion: userPreferences.religion
          } : {},
          userPreferences.caste ? {
            caste: userPreferences.caste
          } : {},
          userPreferences.education ? {
            education: userPreferences.education
          } : {},
          userPreferences.occupation ? {
            occupation: userPreferences.occupation
          } : {},
          userPreferences.location ? {
            workLocation: userPreferences.location
          } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      };

      // Get total count for pagination
      const total = await prisma.profile.count({
        where: whereClause
      });

      // Get matching profiles
      const matches = await prisma.profile.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              photos: {
                where: { isProfile: true },
                take: 1
              }
            }
          }
        }
      });

      return new NextResponse(
        JSON.stringify({
          matches,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch matches' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, matchId, status } = data;

    if (!userId || !matchId || !status) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID, match ID, and status are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const match = await prisma.interest.upsert({
        where: {
          senderId_receiverId: {
            senderId: userId,
            receiverId: matchId
          }
        },
        update: {
          status
        },
        create: {
          senderId: userId,
          receiverId: matchId,
          status
        }
      });

      return new NextResponse(
        JSON.stringify(match),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to save match status' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 