import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/jwt';
import { cookieConfig } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    console.log('Starting login process');
    const { email, password } = await request.json();

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Finding user with email:', email);
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        horoscope: true,
        preferences: true,
      },
    });

    if (!user) {
      console.log('User not found with email:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('Verifying password for user:', user.id);
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log('Invalid password for user:', user.id);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('Creating JWT token for user:', user.id);
    // Create JWT token using centralized utility
    const jwtToken = signJwt({ userId: user.id });

    // Update last login
    console.log('Updating last login timestamp for user:', user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log('Setting authentication cookie for user:', user.id);
    // Set cookie and return response
    const response = NextResponse.json({
      user: userWithoutPassword,
    });

    response.cookies.set('token', jwtToken, cookieConfig);

    console.log('Login process completed successfully for user:', user.id);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { 
        error: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 