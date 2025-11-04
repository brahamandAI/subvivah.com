import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/config/api';

export async function POST(request: Request) {
  try {
    const { message, language, guestName } = await request.json();

    const response = await fetch(API_CONFIG.GPT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.GPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are ब्रह्मांड AI, a helpful and friendly AI assistant. You are speaking in ${language}. ${guestName ? `The user's name is ${guestName}.` : ''}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GPT API Error:', response.status, errorText);
      throw new Error('Failed to get response from GPT API');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in GPT API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 