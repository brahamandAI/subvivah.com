import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verify } from 'jsonwebtoken';

export async function PUT(request: NextRequest) {
  try {
    // Get the token from the cookie
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/token=([^;]+)/);
    const token = match ? match[1] : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, dob, location } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !dob) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate date of birth
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 18 || age > 100) {
      return NextResponse.json({ error: 'Age must be between 18-100 years' }, { status: 400 });
    }

    // Update user's basic information
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dob: new Date(dob)
      }
    });

    // If location is provided, update it in the profile table
    if (location) {
      await prisma.profile.upsert({
        where: { userId: decoded.userId },
        update: {
          workLocation: location.trim()
        },
        create: {
          userId: decoded.userId,
          workLocation: location.trim()
        }
      });
    }

    console.log(`✅ Updated basic info for user ${decoded.userId}`);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        dob: updatedUser.dob
      },
      message: 'Basic information updated successfully'
    });

  } catch (error) {
    console.error('Error updating basic info:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update basic information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 