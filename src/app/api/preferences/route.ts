import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Helper function to validate preferences
function validatePreferences(data: any) {
  const errors: string[] = [];

  if (data.ageFrom && data.ageTo && data.ageFrom > data.ageTo) {
    errors.push('Age "From" must be less than Age "To"');
  }

  if (data.ageFrom && (data.ageFrom < 18 || data.ageFrom > 100)) {
    errors.push('Age "From" must be between 18 and 100');
  }

  if (data.ageTo && (data.ageTo < 18 || data.ageTo > 100)) {
    errors.push('Age "To" must be between 18 and 100');
  }

  return errors;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    try {
      const preferences = await prisma.preferences.findUnique({
        where: { userId }
      });

      if (!preferences) {
        return NextResponse.json(
          { error: 'Preferences not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(preferences);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      userId,
      ageFrom,
      ageTo,
      heightFrom,
      heightTo,
      maritalStatus,
      religion,
      caste,
      education,
      occupation,
      location,
      income
    } = data;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate preferences
    const validationErrors = validatePreferences(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    try {
      const preferences = await prisma.preferences.upsert({
        where: { userId },
        update: {
          ageFrom,
          ageTo,
          heightFrom,
          heightTo,
          maritalStatus,
          religion,
          caste,
          education,
          occupation,
          location,
          income
        },
        create: {
          userId,
          ageFrom,
          ageTo,
          heightFrom,
          heightTo,
          maritalStatus,
          religion,
          caste,
          education,
          occupation,
          location,
          income
        }
      });

      return NextResponse.json(preferences);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save preferences' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const {
      userId,
      ageFrom,
      ageTo,
      heightFrom,
      heightTo,
      maritalStatus,
      religion,
      caste,
      education,
      occupation,
      location,
      income
    } = data;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate preferences
    const validationErrors = validatePreferences(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    try {
      const preferences = await prisma.preferences.upsert({
        where: { userId },
        update: {
          ageFrom,
          ageTo,
          heightFrom,
          heightTo,
          maritalStatus,
          religion,
          caste,
          education,
          occupation,
          location,
          income
        },
        create: {
          userId,
          ageFrom,
          ageTo,
          heightFrom,
          heightTo,
          maritalStatus,
          religion,
          caste,
          education,
          occupation,
          location,
          income
        }
      });

      return NextResponse.json(preferences);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 