import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting AI personalization verification...');
    
    // Try both authentication methods
    let userId: string | undefined;
    
    // 1. Try NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        userId = user.id;
        console.log('✅ Authenticated via NextAuth session');
      }
    }
    
    // 2. Try JWT token if NextAuth failed
    if (!userId) {
      const cookie = request.headers.get('cookie') || '';
      const match = cookie.match(/token=([^;]+)/);
      const token = match ? match[1] : null;
      
      if (token) {
        try {
          const decoded: any = verify(token, process.env.JWT_SECRET || 'your-secret-key');
          userId = decoded.userId;
          console.log('✅ Authenticated via JWT token');
        } catch (error) {
          console.error('❌ JWT verification failed:', error);
        }
      }
    }

    if (!userId) {
      console.log('❌ No valid authentication found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch AI personalization data
    const aiPersonalization = await prisma.aIPersonalization.findUnique({
      where: { userId }
    });

    if (!aiPersonalization) {
      return NextResponse.json({
        success: false,
        message: 'No AI personalization data found',
        verification: {
          exists: false,
          isComplete: false,
          hasShardAnswers: false,
          hasPersonalizedAnswers: false,
          hasProfileSummary: false
        }
      });
    }

    // Verify the data
    const verification = {
      exists: true,
      isComplete: aiPersonalization.isCompleted,
      hasShardAnswers: !!(
        aiPersonalization.foodPreference ||
        aiPersonalization.sleepSchedule ||
        aiPersonalization.socialPersonality ||
        aiPersonalization.religionSpirituality ||
        aiPersonalization.relationshipType ||
        aiPersonalization.careerPriority ||
        aiPersonalization.childrenPreference ||
        aiPersonalization.livingSetup ||
        aiPersonalization.relocationFlexibility ||
        aiPersonalization.marriageTimeline ||
        aiPersonalization.relationshipIntent
      ),
      hasPersonalizedAnswers: !!aiPersonalization.personalizedAnswers,
      hasProfileSummary: !!aiPersonalization.profileSummary,
      completedAt: aiPersonalization.completedAt,
      lastUpdated: aiPersonalization.updatedAt
    };

    console.log('✅ Verification complete:', verification);

    return NextResponse.json({
      success: true,
      verification,
      data: aiPersonalization
    });

  } catch (error) {
    console.error('❌ Error verifying AI personalization:', error);
    return NextResponse.json(
      { error: 'Failed to verify personalization data' },
      { status: 500 }
    );
  }
} 