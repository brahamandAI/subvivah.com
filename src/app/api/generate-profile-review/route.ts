import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    profileData = {},
    interviewResponses = {},
    personalityPreferences = {},
    language = 'en',
  } = body;

  // Handle missing or empty fields gracefully
  const interviewSection = Object.keys(interviewResponses).length > 0
    ? Object.entries(interviewResponses).map(([question, answer]) => `Q: ${question}\nA: ${answer}`).join('\n\n')
    : (language === 'hi' ? 'कोई साक्षात्कार उत्तर प्रदान नहीं किए गए।' : 'No interview responses provided.');

  const personalitySection = Object.keys(personalityPreferences).length > 0
    ? Object.entries(personalityPreferences).map(([key, value]) => `- ${key}: ${value}`).join('\n')
    : (language === 'hi' ? 'कोई व्यक्तित्व वरीयताएँ प्रदान नहीं की गईं।' : 'No personality preferences provided.');

  // Only send the most relevant fields
  const prompt = `Generate a concise (2-3 sentences per section) profile review for a matrimonial profile. The user's information is:

Basic Information:
- Name: ${profileData.fullName || 'N/A'}
- Gender: ${profileData.gender || 'N/A'}
- Age: ${profileData.age || 'N/A'}

Education & Career:
- Education: ${profileData.education || 'N/A'}
- Work Experience: ${profileData.workExperience || 'N/A'}

Family Background:
- Family Type: ${profileData.family?.familyType || 'N/A'}
- Native Place: ${profileData.family?.nativePlace || 'N/A'}

Partner Preferences:
- Age Range: ${profileData.preferences?.ageRange || 'N/A'}
- Education: ${profileData.preferences?.education || 'N/A'}
- Location: ${profileData.preferences?.location || 'N/A'}

Personality Traits:
${personalitySection}

Interview Responses (summarize if too long):
${interviewSection}

Please keep each section concise (2-3 sentences) and the JSON as short as possible. Do not repeat the questions or answers verbatim if too long.

${language === 'hi' ? 'Write the review in Hindi.' : 'Write the review in English.'}

Format the response as a JSON object with the following structure:
{
  "personalityAnalysis": "string",
  "keyStrengths": ["string"],
  "compatibilityFactors": ["string"],
  "lifestyleInsights": ["string"],
  "relationshipPotential": "string"
}`;

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: language === 'hi'
              ? 'आप एक विवाह सलाहकार हैं जो हिंदी में प्रोफाइल रिव्यू लिखते हैं।'
              : 'You are a matrimonial counselor writing profile reviews in English.'
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reviewText = data.choices?.[0]?.message?.content || '';
    console.log('Raw LLM response:', reviewText);
    try {
      let cleaned = reviewText.trim();
      // Remove code block if present
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
      }
      const review = JSON.parse(cleaned);
      return NextResponse.json(review);
    } catch (error) {
      console.error('Error parsing review JSON:', error);
      return NextResponse.json(
        { error: 'Failed to parse LLM response as JSON', raw: reviewText },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating review:', error);
    return NextResponse.json(
      { error: 'Failed to generate profile review' },
      { status: 500 }
    );
  }
} 