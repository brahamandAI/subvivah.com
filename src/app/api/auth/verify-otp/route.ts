import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    // Find and validate verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email,
        token: otp,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
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
      where: { id: verificationToken.id },
    });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again later.' },
      { status: 500 }
    );
  }
} 