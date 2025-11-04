import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { gender, age, education, profession, fullName, family, preferences, language = 'en' } = body;

  const prompt = `Generate 5 personalized interview questions for a matrimonial AI interview. The user is:
- Name: ${fullName || 'N/A'}
- Gender: ${gender || 'N/A'}
- Age: ${age || 'N/A'}
- Education: ${education || 'N/A'}
- Profession: ${profession || 'N/A'}
- Family: ${family || 'N/A'}
- Preferences: ${preferences || 'N/A'}

Questions should be:
1. Open-ended and friendly
2. Relevant to the user's background
3. Focused on understanding their values, relationship goals, and compatibility factors
4. Suitable for a matrimonial context

${language === 'hi' ? 'All questions must be in Hindi.' : 'All questions must be in English.'}

Return only the questions as a numbered list.`;

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
              ? 'आप एक विवाह सलाहकार हैं जो हिंदी में प्रश्न पूछते हैं।'
              : 'You are a matrimonial counselor asking questions in English.'
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    // Parse questions from the response
    const questions = text
      .split(/\n\d+\. /)
      .filter(Boolean)
      .map((q: string) => q.replace(/^\d+\.\s*/, ''));
    if (questions.length > 0) {
      return NextResponse.json({ questions });
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    // If OpenAI fails, fall back to mock questions
  }

  // Fallback questions in both languages
  const fallbackQuestions = {
    hi: [
      'आपके जीवन में सबसे महत्वपूर्ण मूल्य क्या हैं?',
      'आप एक सफल और संतुष्ट जीवनसाथी के लिए किन गुणों को आवश्यक मानते हैं?',
      'आपके परिवार के मूल्य आपके जीवन को कैसे प्रभावित करते हैं?',
      'आप अपने भविष्य के जीवनसाथी से क्या अपेक्षाएं रखते हैं?',
      'आप एक मजबूत और स्थायी रिश्ते के लिए क्या योगदान दे सकते हैं?'
    ],
    en: [
      'What are the most important values in your life?',
      'What qualities do you believe are essential for a successful and fulfilling relationship?',
      'How have your family values influenced your life?',
      'What are your expectations from your future life partner?',
      'What can you contribute to a strong and lasting relationship?'
    ]
  };

  return NextResponse.json({ questions: fallbackQuestions[language as keyof typeof fallbackQuestions] });
} 