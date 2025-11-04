import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verify } from 'jsonwebtoken';

export async function PUT(request: NextRequest) {
  try {
    console.log('Profile update API called');
    
    // Get the token from the cookie
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/token=([^;]+)/);
    const token = match ? match[1] : null;
    
    if (!token) {
      console.log('No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Token verified for user:', decoded.userId);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Received data:', data);

    // Start a transaction to update profile
    const result = await prisma.$transaction(async (tx) => {
      const userId = decoded.userId;
      console.log('Updating profile for user:', userId);
      
      // Update or create profile
      const profile = await tx.profile.upsert({
        where: { userId },
        update: {
          height: data.height,
          weight: data.weight,
          maritalStatus: data.maritalStatus,
          religion: data.religion,
          caste: data.caste,
          subCaste: data.subCaste,
          motherTongue: data.motherTongue,
          education: data.education,
          occupation: data.occupation,
          annualIncome: data.annualIncome,
          workLocation: data.workLocation,
          fatherName: data.fatherName,
          fatherOccupation: data.fatherOccupation,
          motherName: data.motherName,
          motherOccupation: data.motherOccupation,
          siblings: data.siblings,
          familyType: data.familyType,
          familyStatus: data.familyStatus,
          aboutMe: data.aboutMe,
          hobbies: data.hobbies,
          updatedAt: new Date()
        },
        create: {
          userId,
          height: data.height,
          weight: data.weight,
          maritalStatus: data.maritalStatus,
          religion: data.religion,
          caste: data.caste,
          subCaste: data.subCaste,
          motherTongue: data.motherTongue,
          education: data.education,
          occupation: data.occupation,
          annualIncome: data.annualIncome,
          workLocation: data.workLocation,
          fatherName: data.fatherName,
          fatherOccupation: data.fatherOccupation,
          motherName: data.motherName,
          motherOccupation: data.motherOccupation,
          siblings: data.siblings,
          familyType: data.familyType,
          familyStatus: data.familyStatus,
          aboutMe: data.aboutMe,
          hobbies: data.hobbies
        }
      });

      console.log('Profile updated successfully:', profile);
      return profile;
    });

    console.log(`✅ Updated profile for user ${decoded.userId}`);

    return NextResponse.json({
      success: true,
      profile: result,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 