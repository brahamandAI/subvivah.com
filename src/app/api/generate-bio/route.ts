import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import prisma from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userId, hobbies, education, occupation, maritalStatus, religion, workLocation } = await request.json();

    // Fetch user preferences
    const preferences = await prisma.preferences.findFirst({
      where: { userId },
    });

    // Create a more detailed prompt for better bio generation
    const prompt = `Create an engaging and personalized bio for a matrimonial profile based on the following details:

    Personal Details:
    - Education: ${education || 'Not specified'}
    - Occupation: ${occupation || 'Not specified'}
    - Marital Status: ${maritalStatus || 'Not specified'}
    - Religion: ${religion || 'Not specified'}
    - Work Location: ${workLocation || 'Not specified'}
    - Hobbies: ${hobbies?.length > 0 ? hobbies.join(', ') : 'Not specified'}

    Partner Preferences:
    - Age Range: ${preferences?.ageFrom || 'Any'} to ${preferences?.ageTo || 'Any'} years
    - Height Range: ${preferences?.heightFrom || 'Any'} to ${preferences?.heightTo || 'Any'} cm
    - Marital Status: ${preferences?.maritalStatus || 'Any'}
    - Religion: ${preferences?.religion || 'Any'}
    - Education: ${preferences?.education || 'Any'}
    - Occupation: ${preferences?.occupation || 'Any'}

    Guidelines for bio creation:
    1. Maximum 40 words
    2. Include 3-4 emojis placed naturally within the text
    3. Structure the bio in this order:
       - Start with professional background/education
       - Mention personality traits or values
       - Include hobbies or interests
       - End with a brief mention of what they seek in a partner
    4. Use a warm, friendly tone while maintaining professionalism
    5. Highlight unique qualities and aspirations
    6. Incorporate partner preferences subtly without being too specific
    7. Make it personal and authentic

    Example format (but create unique content):
    "👨‍💼 Software engineer with an MBA, passionate about innovation. Enjoy photography 📸 and hiking 🏃‍♂️. Looking for an educated, like-minded partner who shares my values and zest for life."`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert at writing engaging matrimonial bios that capture the essence of a person while being concise and authentic. Focus on creating a natural flow between professional background, personal qualities, and partner preferences. Use emojis thoughtfully to enhance readability and engagement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 150,
      temperature: 0.7,
    });

    const generatedBio = completion.choices[0].message.content?.trim();

    return NextResponse.json({ bio: generatedBio });
  } catch (error) {
    console.error('Error generating bio:', error);
    return NextResponse.json(
      { error: 'Failed to generate bio' },
      { status: 500 }
    );
  }
} 