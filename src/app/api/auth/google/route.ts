import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/db';
import { signJwt } from '@/lib/jwt';
import { cookieConfig } from '@/lib/auth';

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
});

export async function POST(request: Request) {
  try {
    console.log('🔄 ===== GOOGLE AUTH PROCESS STARTED =====');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('Server Client ID exists:', !!process.env.GOOGLE_CLIENT_ID);
    console.log('Public Client ID exists:', !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    
    const { token } = await request.json();

    if (!token) {
      console.log('❌ No token provided in request');
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Verifying Google token...');
    try {
      // Try with the server-side client ID first
      let ticket;
      try {
        ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
      } catch (serverError) {
        console.log('⚠️ Failed to verify with server client ID, trying public client ID...');
        // If that fails, try with the public client ID
        ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });
      }

      const payload = ticket.getPayload();
      if (!payload) {
        console.log('❌ Invalid token payload');
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 400 }
        );
      }

      console.log('✅ Token verified successfully');
      console.log('Token payload:', {
        email: payload.email,
        name: payload.name,
        picture: payload.picture ? 'Present' : 'Missing',
        sub: payload.sub
      });

      const { email, name, picture, sub } = payload;

      if (!email) {
        console.log('❌ No email in token payload');
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        );
      }

      console.log('👤 Finding or creating user for email:', email);
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.log('👤 Creating new user for email:', email);
        user = await prisma.user.create({
          data: {
            email,
            firstName: name?.split(' ')[0] || '',
            lastName: name?.split(' ').slice(1).join(' ') || '',
            gender: 'Not Specified',
            dob: new Date(),
            password: '',
            profile: {
              create: {}
            }
          },
        });
        console.log('✅ New user created:', user.id);
      } else {
        console.log('✅ Existing user found:', user.id);
      }

      console.log('🔑 Creating JWT token for user:', user.id);
      const jwtToken = signJwt({ userId: user.id });

      const response = NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });

      console.log('🍪 Setting authentication cookies');
      response.cookies.set('token', jwtToken, cookieConfig);
      response.cookies.set('google_token', token, cookieConfig);

      console.log('✅ ===== GOOGLE AUTH PROCESS COMPLETED =====');
      return response;
    } catch (verifyError) {
      console.error('❌ Error verifying Google token:', verifyError);
      console.error('Error details:', {
        name: verifyError instanceof Error ? verifyError.name : 'Unknown',
        message: verifyError instanceof Error ? verifyError.message : 'Unknown error',
        stack: verifyError instanceof Error ? verifyError.stack : 'No stack trace'
      });
      return NextResponse.json(
        { 
          error: 'Token verification failed',
          details: verifyError instanceof Error ? verifyError.message : 'Unknown error'
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('❌ Google authentication error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 