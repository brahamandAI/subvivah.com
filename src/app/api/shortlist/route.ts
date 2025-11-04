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
      const shortlistedProfiles = await prisma.shortlist.findMany({
        where: { userId },
        include: {
          shortlistedUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              photos: {
                where: { isProfile: true },
                take: 1
              },
              profile: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return new NextResponse(
        JSON.stringify(shortlistedProfiles),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch shortlisted profiles' }),
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
    const { userId, shortlistedUserId } = data;

    if (!userId || !shortlistedUserId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID and Shortlisted User ID are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Check if already shortlisted
      const existingShortlist = await prisma.shortlist.findUnique({
        where: {
          userId_shortlistedUserId: {
            userId,
            shortlistedUserId
          }
        }
      });

      if (existingShortlist) {
        return new NextResponse(
          JSON.stringify({ error: 'Profile already shortlisted' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const shortlist = await prisma.shortlist.create({
        data: {
          userId,
          shortlistedUserId
        },
        include: {
          shortlistedUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              photos: {
                where: { isProfile: true },
                take: 1
              },
              profile: true
            }
          }
        }
      });

      // Create notification for shortlisted user
      await prisma.notification.create({
        data: {
          userId: shortlistedUserId,
          type: 'shortlist',
          message: `You have been shortlisted by ${shortlist.shortlistedUser.firstName} ${shortlist.shortlistedUser.lastName}`
        }
      });

      return new NextResponse(
        JSON.stringify(shortlist),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to shortlist profile' }),
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const shortlistedUserId = searchParams.get('shortlistedUserId');

    if (!userId || !shortlistedUserId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID and Shortlisted User ID are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      await prisma.shortlist.delete({
        where: {
          userId_shortlistedUserId: {
            userId,
            shortlistedUserId
          }
        }
      });

      return new NextResponse(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to remove from shortlist' }),
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