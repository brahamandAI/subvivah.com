import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Starting AI personalization save...');
    
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

    // Get request body
    const body = await request.json();
    const {
      shardAnswers,
      personalizedAnswers,
      profileSummary,
      isCompleted
    } = body;

    console.log('📝 Saving AI personalization data:', {
      userId,
      isCompleted,
      hasShardAnswers: !!shardAnswers,
      hasPersonalizedAnswers: !!personalizedAnswers,
      hasProfileSummary: !!profileSummary
    });

    // Map shard answers to the schema fields
    const aiPersonalizationData = {
      userId,
      isCompleted: isCompleted || false,
      foodPreference: shardAnswers?.foodPreference || shardAnswers?.['food-preference'] || shardAnswers?.['food_preference'],
      sleepSchedule: shardAnswers?.sleepSchedule || shardAnswers?.['sleep-schedule'] || shardAnswers?.['sleep_schedule'],
      socialPersonality: shardAnswers?.socialPersonality || shardAnswers?.['social-personality'] || shardAnswers?.['social_personality'],
      religionSpirituality: shardAnswers?.religionSpirituality || shardAnswers?.['religion-spirituality'] || shardAnswers?.['religion_spirituality'],
      relationshipType: shardAnswers?.relationshipType || shardAnswers?.['relationship-type'] || shardAnswers?.['relationship_type'],
      careerPriority: shardAnswers?.careerPriority || shardAnswers?.['career-priority'] || shardAnswers?.['career_priority'],
      childrenPreference: shardAnswers?.childrenPreference || shardAnswers?.['children-preference'] || shardAnswers?.['children_preference'],
      livingSetup: shardAnswers?.livingSetup || shardAnswers?.['living-setup'] || shardAnswers?.['living_setup'],
      relocationFlexibility: shardAnswers?.relocationFlexibility || shardAnswers?.['relocation-flexibility'] || shardAnswers?.['relocation_flexibility'],
      marriageTimeline: shardAnswers?.marriageTimeline || shardAnswers?.['marriage-timeline'] || shardAnswers?.['marriage_timeline'],
      relationshipIntent: shardAnswers?.relationshipIntent || shardAnswers?.['relationship-intent'] || shardAnswers?.['relationship_intent'],
      personalizedAnswers: personalizedAnswers || undefined,
      profileSummary: profileSummary || undefined,
      completedAt: isCompleted ? new Date() : null
    };

    console.log('📝 Mapped AI personalization data:', aiPersonalizationData);

    // Use upsert to create or update
    const savedData = await prisma.aIPersonalization.upsert({
      where: {
        userId
      },
      update: aiPersonalizationData,
      create: aiPersonalizationData
    });

    console.log('✅ Successfully saved AI personalization data');

    return NextResponse.json({ 
      success: true, 
      data: savedData 
    });

  } catch (error) {
    console.error('❌ Error saving AI personalization:', error);
    return NextResponse.json(
      { error: 'Failed to save personalization data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 Starting AI personalization fetch...');
    
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

    console.log('👤 User ID:', userId);

    const aiPersonalization = await prisma.aIPersonalization.findUnique({
      where: { userId }
    });

    console.log('✅ Successfully fetched AI personalization:', {
      found: !!aiPersonalization,
      isCompleted: aiPersonalization?.isCompleted
    });

    return NextResponse.json({ 
      success: true, 
      data: aiPersonalization 
    });

  } catch (error) {
    console.error('❌ Error fetching AI personalization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalization data' },
      { status: 500 }
    );
  }
} 