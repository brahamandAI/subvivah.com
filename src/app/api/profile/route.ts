import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            horoscope: true,
            preferences: true,
            photos: true,
          }
        }
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, ...profileData } = data;

    const profile = await prisma.profile.create({
      data: {
        userId,
        ...profileData,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { userId, ...profileData } = data;

    const profile = await prisma.profile.update({
      where: { userId },
      data: profileData,
    });

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 