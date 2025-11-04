import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { shardAnswers, personalizedAnswers, language } = await request.json();

    // Create a comprehensive prompt for profile summary
    const prompt = `Based on the following user's shard preferences and personalized answers, generate a comprehensive profile summary for a matrimonial service.

User Shard Preferences:
${Object.entries(shardAnswers).map(([key, value]) => `${key}: ${value}`).join('\n')}

User Personalized Answers:
${Object.entries(personalizedAnswers).map(([key, value]) => `${key}: ${value}`).join('\n')}

Generate a comprehensive profile summary in ${language === 'hi' ? 'Hindi' : 'English'} that includes:

1. A concise but detailed summary paragraph (2-3 sentences)
2. 4-5 key personality traits and characteristics
3. Compatibility notes for potential matches
4. Specific match preferences and requirements

Format the response as JSON:
{
  "summary": "A 2-3 sentence summary of the person's profile",
  "keyTraits": [
    "Trait 1",
    "Trait 2",
    "Trait 3",
    "Trait 4"
  ],
  "compatibilityNotes": "Detailed notes about what kind of partner would be compatible",
  "matchPreferences": "Specific preferences for potential matches and relationship requirements"
}

Make it engaging, positive, and suitable for a matrimonial context. Focus on compatibility and relationship potential.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert marriage counselor and profile writer for a premium matrimonial service. Create engaging, positive, and detailed profile summaries that highlight compatibility and relationship potential."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let summary;
    try {
      summary = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response);
      throw new Error('Invalid response format from AI');
    }

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate profile summary' },
      { status: 500 }
    );
  }
} 