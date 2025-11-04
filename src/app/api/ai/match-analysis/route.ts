import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/db';

// Initialize OpenAI with proper error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json(
        { error: 'AI analysis service is not configured' },
        { status: 503 }
      );
    }

    const { userId, matchedUserId } = await request.json();

    if (!userId || !matchedUserId) {
      return NextResponse.json(
        { error: 'Both user IDs are required' },
        { status: 400 }
      );
    }

    // Fetch both users' profiles
    const [userProfile, matchedProfile] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              gender: true,
            }
          }
        }
      }),
      prisma.profile.findUnique({
        where: { userId: matchedUserId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              gender: true,
            }
          }
        }
      })
    ]);

    if (!userProfile || !matchedProfile) {
      return NextResponse.json(
        { error: 'One or both profiles not found' },
        { status: 404 }
      );
    }

    // Prepare data for OpenAI
    const prompt = `
Analyze the compatibility between these two profiles and generate a personalized message:

User 1 (${userProfile.user.gender}):

Name: ${userProfile.user.firstName} ${userProfile.user.lastName}

Education: ${userProfile.education || 'Not specified'}

Occupation: ${userProfile.occupation || 'Not specified'}

Location: ${userProfile.workLocation || 'Not specified'}

About: ${userProfile.aboutMe || 'Not specified'}

User 2 (${matchedProfile.user.gender}):

Name: ${matchedProfile.user.firstName} ${matchedProfile.user.lastName}

Education: ${matchedProfile.education || 'Not specified'}

Occupation: ${matchedProfile.occupation || 'Not specified'}

Location: ${matchedProfile.workLocation || 'Not specified'}

About: ${matchedProfile.aboutMe || 'Not specified'}

Please provide:

A compatibility summary in exactly 6 lines, highlighting how they complement each other. Keep it friendly and positive.

2–3 shared interests or conversation starters

A casual, warm ice-breaker message

Simple first meeting suggestions, considering distance or schedules.

 strictly remove **symbols on the response

Keep the tone friendly and complimentary, focusing on shared values and natural connection.

also add emojis to every few lines to create more engaging and friendly tone

`;

    try {
      // Call OpenAI API with error handling
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional matchmaking assistant. Provide thoughtful, personalized analysis and suggestions for potential matches."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 500
      });

      const analysis = completion.choices[0].message.content;

      return NextResponse.json({
        analysis,
        userProfile: {
          name: `${userProfile.user.firstName} ${userProfile.user.lastName}`,
          education: userProfile.education,
          occupation: userProfile.occupation,
          location: userProfile.workLocation,
          about: userProfile.aboutMe
        },
        matchedProfile: {
          name: `${matchedProfile.user.firstName} ${matchedProfile.user.lastName}`,
          education: matchedProfile.education,
          occupation: matchedProfile.occupation,
          location: matchedProfile.workLocation,
          about: matchedProfile.aboutMe
        }
      });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return NextResponse.json(
        { error: 'Failed to generate AI analysis', details: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('AI Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 