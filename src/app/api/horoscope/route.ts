import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Helper function to validate horoscope data
function validateHoroscope(data: any) {
  const errors: string[] = [];

  if (!data.userId) {
    errors.push('User ID is required');
  }

  if (!data.dateOfBirth) {
    errors.push('Date of birth is required');
  } else {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const minDate = new Date('1900-01-01');
    
    if (birthDate > today) {
      errors.push('Date of birth cannot be in the future');
    }
    
    if (birthDate < minDate) {
      errors.push('Date of birth must be after 1900');
    }
  }

  if (data.gender && !['male', 'female', 'other'].includes(data.gender.toLowerCase())) {
    errors.push('Gender must be male, female, or other');
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
      const horoscope = await prisma.horoscope.findUnique({
        where: { userId }
      });

      if (!horoscope) {
        return NextResponse.json(
          { error: 'Horoscope not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(horoscope);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch horoscope' },
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
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      gender,
      kundliData,
      rashi,
      nakshatra,
      gotra,
      manglik
    } = data;

    // Validate horoscope data
    const validationErrors = validateHoroscope(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(', ') },
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
      const horoscope = await prisma.horoscope.create({
        data: {
          userId,
          dateOfBirth: new Date(dateOfBirth),
          timeOfBirth,
          placeOfBirth,
          gender,
          kundliData,
          rashi,
          nakshatra,
          gotra,
          manglik
        }
      });

      return NextResponse.json(horoscope);
    } catch (error) {
      console.error('Database error:', error);
      
      // Check if it's a unique constraint violation
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Horoscope already exists for this user' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to save horoscope' },
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
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      gender,
      kundliData,
      rashi,
      nakshatra,
      gotra,
      manglik
    } = data;

    // Validate horoscope data
    const validationErrors = validateHoroscope(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(', ') },
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
      const horoscope = await prisma.horoscope.upsert({
        where: { userId },
        update: {
          dateOfBirth: new Date(dateOfBirth),
          timeOfBirth,
          placeOfBirth,
          gender,
          kundliData,
          rashi,
          nakshatra,
          gotra,
          manglik
        },
        create: {
          userId,
          dateOfBirth: new Date(dateOfBirth),
          timeOfBirth,
          placeOfBirth,
          gender,
          kundliData,
          rashi,
          nakshatra,
          gotra,
          manglik
        }
      });

      return NextResponse.json(horoscope);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update horoscope' },
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