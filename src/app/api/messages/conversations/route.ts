import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verify } from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
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

    // Get all messages where the user is either sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: decoded.userId },
          { receiverId: decoded.userId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
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
            photos: {
              where: { isProfile: true },
              take: 1
            }
          }
        }
      }
    });

    // Group messages by conversation
    const conversationMap = new Map();
    messages.forEach((message) => {
      const otherUserId = message.senderId === decoded.userId ? message.receiverId : message.senderId;
      const otherUser = message.senderId === decoded.userId ? message.receiver : message.sender;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          id: otherUserId,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          photo: otherUser.photos[0]?.url || null,
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: 0
        });
      }

      // Update unread count
      if (!message.isRead && message.receiverId === decoded.userId) {
        conversationMap.get(otherUserId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationMap.values());

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
} 