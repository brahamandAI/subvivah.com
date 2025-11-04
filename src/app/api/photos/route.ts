import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    try {
      const photos = await prisma.photo.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(photos);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch photos' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, url, isProfile } = data;

    if (!userId || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      // If this is a profile photo, unset other profile photos
      if (isProfile) {
        await prisma.photo.updateMany({
          where: { userId, isProfile: true },
          data: { isProfile: false }
        });
      }

      const photo = await prisma.photo.create({
        data: {
          userId,
          url,
          isProfile: isProfile || false
        }
      });

      return NextResponse.json(photo);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to upload photo' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    try {
      await prisma.photo.delete({
        where: { id: photoId }
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete photo' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 