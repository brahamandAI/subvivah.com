import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sign } from 'jsonwebtoken';
import { signJwt } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Verify Facebook token
    const response = await fetch(
      `https://graph.facebook.com/v12.0/me?fields=id,name,email,picture&access_token=${accessToken}`
    );
    const data = await response.json();

    if (!data.id) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    const { email, name, picture } = data;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          email,
          password: '', // Required field, but we'll handle this differently for social auth
          firstName: data.name?.split(' ')[0] || '',
          lastName: data.name?.split(' ').slice(1).join(' ') || '',
          gender: '', // Required field, will need to be updated later
          dob: new Date(), // Required field, will need to be updated later
          isVerified: true, // Facebook verified emails are considered verified
          isActive: true,
          profile: {
            create: {
              height: null,
              weight: null,
              maritalStatus: null,
              religion: null,
              caste: null,
              motherTongue: null,
              education: null,
              occupation: null,
              annualIncome: null,
              workLocation: null,
              fatherName: null,
              fatherOccupation: null,
              motherName: null,
              motherOccupation: null,
              siblings: null,
              familyType: null,
              familyStatus: null,
              aboutMe: null,
              hobbies: null,
            },
          },
        },
        include: { profile: true },
      });
      user = newUser;
    }

    // Create JWT token using centralized utility
    const jwtToken = signJwt({ userId: user.id });

    // Set cookie
    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.isVerified,
        profile: user.profile,
      },
    });

    res.cookies.set('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error) {
    console.error('Facebook authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 