import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import nodemailer from 'nodemailer';

// Create transporter only if email configuration is available
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  
  console.log('📧 Email Configuration:', {
    emailUser: emailUser ? 'configured' : 'missing',
    emailPassword: emailPassword ? 'configured' : 'missing'
  });
  
  if (!emailUser || !emailPassword) {
    console.warn('⚠️ Email configuration not found. EMAIL_USER and EMAIL_PASSWORD must be set for password reset emails.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  // Verify transporter
  transporter.verify(function(error, success) {
    if (error) {
      console.error('❌ SMTP Connection Error:', error);
    } else {
      console.log('✅ SMTP Connection Success:', success);
    }
  });

  return transporter;
};

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    console.log('🔄 Starting password reset process...');
    const { email } = await request.json();
    console.log('📧 Reset requested for email:', email);

    if (!email) {
      console.warn('⚠️ No email provided in request');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ User not found for email:', email);
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        message: 'If an account with this email exists, a verification code has been sent.' 
      });
    }

    console.log('✅ User found:', { id: user.id, email: user.email });

    // Generate OTP
    const otp = generateOTP();
    console.log('🔑 Generated OTP:', otp);

    // Save OTP to database with expiration
    const verificationToken = await prisma.verificationToken.create({
      data: {
        token: otp,
        email,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      },
    });
    console.log('💾 Saved verification token:', { id: verificationToken.id, expiresAt: verificationToken.expiresAt });

    // Check if email configuration is available
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn('⚠️ Email transporter not configured, logging OTP for development');
      console.log('📧 Password reset OTP generated (email not configured):', otp);
      console.log('📧 Would send to:', email);
      
      return NextResponse.json({ 
        message: 'If an account with this email exists, a verification code has been sent.',
        note: 'Email configuration not set up. Check console for OTP in development.'
      });
    }

    console.log('📨 Attempting to send email...');

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset your password - शुभ विवाह',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">शुभ विवाह</h1>
              <p style="color: white; margin: 10px 0 0 0;">Password Reset Verification Code</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.firstName},</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We received a request to reset your password for your शुभ विवाह account. 
                If you didn't make this request, you can safely ignore this email.
              </p>
              
              <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f0f0f0; border-radius: 10px;">
                <h3 style="color: #333; margin: 0 0 10px 0;">Your verification code is:</h3>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #764ba2;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                This code will expire in 1 hour for security reasons.
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                This is an automated email from शुभ विवाह. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
      });
      console.log('✅ Email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      throw emailError;
    }

    return NextResponse.json({ 
      message: 'If an account with this email exists, a verification code has been sent.' 
    });
  } catch (error) {
    console.error('❌ Error in forgot-password:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('email') || error.message.includes('mail')) {
        console.error('❌ Email service error:', error.message);
        return NextResponse.json(
          { error: 'Email service temporarily unavailable. Please try again later.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to process password reset request. Please try again later.' },
      { status: 500 }
    );
  }
} 