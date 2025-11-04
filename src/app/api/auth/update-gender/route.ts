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

    const { gender, isVerified } = await request.json();

    // Validate gender
    if (!gender || !['male', 'female', 'other'].includes(gender.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid gender value' }, { status: 400 });
    }

    // Update user's gender and verification status
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        gender: gender.toLowerCase(),
        isVerified: isVerified || false
      }
    });

    console.log(`✅ Updated gender for user ${decoded.userId} to ${gender}`);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        gender: updatedUser.gender,
        isVerified: updatedUser.isVerified
      },
      message: 'Gender updated successfully'
    });

  } catch (error) {
    console.error('Error updating gender:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update gender',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 