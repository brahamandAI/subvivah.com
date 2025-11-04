import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { aiAnswers } = await req.json();

    const prompt = `Based on the following user's answers to our questions, generate 6 "This-or-That" preference cards. Each card should have two contrasting options that are relevant to their interests and values.

User's Answers:
${aiAnswers.map((answer: string, index: number) => `Answer ${index + 1}: ${answer}`).join('\n')}

Generate 6 cards that:
1. Are based on themes extracted from their answers
2. Have contrasting but equally valid options
3. Include relevant emojis for each option
4. Are suitable for a matrimonial context

Format the response as a JSON object with a "cards" array. Each card should have:
- id: number
- left: string (first option)
- right: string (second option)
- leftEmoji: string (emoji for first option)
- rightEmoji: string (emoji for second option)`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const response = JSON.parse(content);
    const cards = response.cards;

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Error generating cards:', error);
    return NextResponse.json(
      { error: 'Failed to generate cards' },
      { status: 500 }
    );
  }
} 