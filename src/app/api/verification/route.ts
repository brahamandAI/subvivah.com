import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const verification = await prisma.verification.findUnique({
        where: { userId }
      });

      return new NextResponse(
        JSON.stringify(verification),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch verification status' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, documentType, documentUrl, selfieUrl } = data;

    if (!userId || !documentType || !documentUrl || !selfieUrl) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const verification = await prisma.verification.upsert({
        where: { userId },
        update: {
          documentType,
          documentUrl,
          selfieUrl,
          status: 'pending',
          submittedAt: new Date()
        },
        create: {
          userId,
          documentType,
          documentUrl,
          selfieUrl,
          status: 'pending',
          submittedAt: new Date()
        }
      });

      // Create notification for admin
      await prisma.notification.create({
        data: {
          userId: 'admin', // This should be replaced with actual admin user ID
          type: 'verification',
          message: `New verification request from user ${userId}`
        }
      });

      return new NextResponse(
        JSON.stringify(verification),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to submit verification request' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { userId, status, adminNotes } = data;

    if (!userId || !status || !['approved', 'rejected'].includes(status)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const verification = await prisma.verification.update({
        where: { userId },
        data: {
          status,
          adminNotes,
          reviewedAt: new Date()
        }
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId,
          type: 'verification',
          message: `Your verification request has been ${status}`
        }
      });

      return new NextResponse(
        JSON.stringify(verification),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to update verification status' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 