import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        aiPersonalization: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isCompleted = user.aiPersonalization?.isCompleted || false;

    return NextResponse.json({ 
      success: true, 
      isCompleted,
      hasStarted: !!user.aiPersonalization,
      data: user.aiPersonalization
    });

  } catch (error) {
    console.error('Error checking AI personalization completion:', error);
    return NextResponse.json(
      { error: 'Failed to check completion status' },
      { status: 500 }
    );
  }
} 