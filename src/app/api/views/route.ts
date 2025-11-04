import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const views = await prisma.profileView.findMany({
        where: { viewedUserId: userId },
        include: {
          viewer: {
            select: {
              firstName: true,
              lastName: true,
              photos: {
                where: { isProfile: true },
                take: 1
              }
            }
          }
        },
        orderBy: { viewedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      });

      const total = await prisma.profileView.count({
        where: { viewedUserId: userId }
      });

      return new NextResponse(
        JSON.stringify({
          views,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch profile views' }),
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
    const { viewerId, viewedUserId } = data;

    if (!viewerId || !viewedUserId) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Check if this is a premium feature
      const viewerMembership = await prisma.membership.findUnique({
        where: { userId: viewerId }
      });

      if (!viewerMembership || viewerMembership.plan === 'free') {
        return new NextResponse(
          JSON.stringify({ error: 'Premium feature not available' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const view = await prisma.profileView.create({
        data: {
          viewerId,
          viewedUserId,
          viewedAt: new Date()
        },
        include: {
          viewer: {
            select: {
              firstName: true,
              lastName: true,
              photos: {
                where: { isProfile: true },
                take: 1
              }
            }
          }
        }
      });

      // Create notification for viewed user
      await prisma.notification.create({
        data: {
          userId: viewedUserId,
          type: 'profile_view',
          message: `Your profile was viewed by ${view.viewer.firstName} ${view.viewer.lastName}`
        }
      });

      return new NextResponse(
        JSON.stringify(view),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to record profile view' }),
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