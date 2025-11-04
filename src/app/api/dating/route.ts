import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's preferences
    const userPreferences = await prisma.preferences.findUnique({
      where: { userId },
    });

    if (!userPreferences) {
      return NextResponse.json(
        { error: 'User preferences not found' },
        { status: 404 }
      );
    }

    // Build search criteria based on preferences
    const whereClause = {
      AND: [
        {
          user: {
            dob: {
              gte: new Date(new Date().setFullYear(new Date().getFullYear() - (userPreferences.ageTo || 100))),
              lte: new Date(new Date().setFullYear(new Date().getFullYear() - (userPreferences.ageFrom || 18))),
            },
            gender: userPreferences.maritalStatus || undefined,
          },
        },
        {
          NOT: {
            userId: userId,
          },
        },
      ],
    };

    // Get potential matches
    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where: whereClause,
        include: {
          user: {
            include: {
              photos: {
                where: { isProfile: true },
                take: 1,
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.profile.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      profiles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching dating profiles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, restaurant, date, time } = body;

    if (!userId || !restaurant || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Note: You'll need to create a RestaurantBooking model in your schema
    // For now, we'll return an error
    return NextResponse.json(
      { error: 'Restaurant booking functionality not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error creating restaurant booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 