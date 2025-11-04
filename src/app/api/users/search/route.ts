import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verify } from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

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

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: decoded.userId // Exclude current user
            }
          },
          {
            OR: [
              {
                firstName: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                lastName: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photos: {
          where: {
            isProfile: true
          },
          select: {
            url: true
          },
          take: 1
        }
      },
      take: 10
    });

    // Transform the response to match the User interface
    const transformedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      photo: user.photos[0]?.url || null
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
} 