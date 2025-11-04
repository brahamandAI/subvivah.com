import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'received'; // 'sent' or 'received'

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const interests = await prisma.interest.findMany({
        where: type === 'sent' ? { senderId: userId } : { receiverId: userId },
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              photos: {
                where: { isProfile: true },
                take: 1
              }
            }
          },
          receiver: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              photos: {
                where: { isProfile: true },
                take: 1
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return new NextResponse(
        JSON.stringify(interests),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch interests' }),
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
    const { senderId, receiverId } = data;

    if (!senderId || !receiverId) {
      return new NextResponse(
        JSON.stringify({ error: 'Sender ID and Receiver ID are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Check if interest already exists
      const existingInterest = await prisma.interest.findUnique({
        where: {
          senderId_receiverId: {
            senderId,
            receiverId
          }
        }
      });

      if (existingInterest) {
        return new NextResponse(
          JSON.stringify({ error: 'Interest already sent' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Create new interest
      const interest = await prisma.interest.create({
        data: {
          senderId,
          receiverId,
          status: 'pending'
        },
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              photos: {
                where: { isProfile: true },
                take: 1
              }
            }
          },
          receiver: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              photos: {
                where: { isProfile: true },
                take: 1
              }
            }
          }
        }
      });

      // Create notification for receiver
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'interest',
          message: `New interest received from ${interest.sender.firstName} ${interest.sender.lastName}`
        }
      });

      return new NextResponse(
        JSON.stringify(interest),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to send interest' }),
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
    const { interestId, status } = data;

    if (!interestId || !status) {
      return new NextResponse(
        JSON.stringify({ error: 'Interest ID and status are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const interest = await prisma.interest.update({
        where: { id: interestId },
        data: { status },
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              photos: {
                where: { isProfile: true },
                take: 1
              }
            }
          },
          receiver: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              photos: {
                where: { isProfile: true },
                take: 1
              }
            }
          }
        }
      });

      // Create notification for sender
      await prisma.notification.create({
        data: {
          userId: interest.senderId,
          type: 'interest',
          message: `Your interest has been ${status} by ${interest.receiver.firstName} ${interest.receiver.lastName}`
        }
      });

      return new NextResponse(
        JSON.stringify(interest),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to update interest' }),
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