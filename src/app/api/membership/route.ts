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
      const membership = await prisma.membership.findUnique({
        where: { userId }
      });

      if (!membership) {
        return new NextResponse(
          JSON.stringify({ error: 'Membership not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new NextResponse(
        JSON.stringify(membership),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch membership' }),
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
    const { userId, plan, duration, paymentStatus } = data;

    if (!userId || !plan || !duration || !paymentStatus) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + duration);

    type MembershipPlan = 'basic' | 'premium' | 'platinum';
    const features: Record<MembershipPlan, string[]> = {
      'basic': ['View profiles', 'Send interests'],
      'premium': ['View profiles', 'Send interests', 'View contact details', 'Priority customer support'],
      'platinum': ['View profiles', 'Send interests', 'View contact details', 'Priority customer support', 'Advanced search', 'Profile boost']
    };

    const planFeatures = features[plan as MembershipPlan] || [];

    try {
      const membership = await prisma.membership.upsert({
        where: { userId },
        update: {
          plan,
          duration,
          paymentStatus,
          startDate,
          endDate,
          features: planFeatures,
          isActive: paymentStatus === 'completed'
        },
        create: {
          userId,
          plan,
          duration,
          paymentStatus,
          startDate,
          endDate,
          features: planFeatures,
          isActive: paymentStatus === 'completed'
        }
      });

      return new NextResponse(
        JSON.stringify(membership),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to save membership' }),
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
    const { id, ...membershipData } = data;

    const membership = await prisma.membership.update({
      where: { id },
      data: membershipData,
    });

    return NextResponse.json(membership);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 