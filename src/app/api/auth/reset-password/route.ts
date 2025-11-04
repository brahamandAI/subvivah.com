import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJwt } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyJwt(token) as any;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new password reset.' },
        { status: 400 }
      );
    }
    
    if (!decoded || !decoded.userId || !decoded.email) {
      return NextResponse.json(
        { error: 'Invalid reset link. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Find and validate verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid reset link. Please request a new password reset.' },
        { status: 400 }
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please request a new password reset.' },
        { status: 404 }
      );
    }

    // Validate password requirements
    const passwordRequirements = {
      length: newPassword.length >= 8,
      letter: /[a-zA-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };

    if (!Object.values(passwordRequirements).every(Boolean)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long and contain at least one letter, one number, and one special character' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in reset-password:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('JWT')) {
        return NextResponse.json(
          { error: 'Authentication service temporarily unavailable. Please try again later.' },
          { status: 500 }
        );
      }
      if (error.message.includes('database') || error.message.includes('prisma')) {
        return NextResponse.json(
          { error: 'Database service temporarily unavailable. Please try again later.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again later.' },
      { status: 500 }
    );
  }
} 