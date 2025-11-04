import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verify } from 'jsonwebtoken';

interface Message {
  senderId: string;
  receiverId: string;
  isRead: boolean;
  sender: any; // Replace 'any' with a more specific type if available
  receiver: any; // Replace 'any' with a more specific type if available
}

// GET /api/messages?conversationId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Get the current user's ID from the token
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/token=([^;]+)/);
    const token = match ? match[1] : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: decoded.userId,
            receiverId: conversationId
          },
          {
            senderId: conversationId,
            receiverId: decoded.userId
          }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: conversationId,
        receiverId: decoded.userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Receiver ID and content are required' }, { status: 400 });
    }

    // Get the current user's ID from the token
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/token=([^;]+)/);
    const token = match ? match[1] : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: decoded.userId,
        receiverId,
        isRead: false
      }
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { messageIds } = data;

    if (!messageIds || !Array.isArray(messageIds)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid message IDs' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      await prisma.message.updateMany({
        where: {
          id: {
            in: messageIds
          }
        },
        data: {
          isRead: true
        }
      });

      return new NextResponse(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to mark messages as read' }),
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