import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { shardAnswers, language } = await request.json();

    // Create a prompt based on the shard answers
    const prompt = `Based on the following user preferences, generate 5-7 personalized questions about marriage, relationships, and partner matching. For each question, also provide 3-4 suggested answer options (shards) that users can select from.

User Preferences:
${Object.entries(shardAnswers).map(([key, value]) => `${key}: ${value}`).join('\n')}

Generate questions that are:
1. Relevant to their specific preferences
2. Focused on marriage and relationship compatibility
3. Deep and meaningful for matching
4. In ${language === 'hi' ? 'Hindi' : 'English'} language
5. Include categories like: communication style, future goals, family values, lifestyle compatibility, emotional needs

For each question, provide 3-4 suggested answer options that users can quickly select from, plus an option to write their own answer.

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON.

Format the response as JSON:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "The question text",
      "category": "category_name",
      "importance": "high|medium|low",
      "suggestedAnswers": [
        {
          "id": "option_1",
          "text": "First suggested answer",
          "icon": "🎯"
        },
        {
          "id": "option_2", 
          "text": "Second suggested answer",
          "icon": "💭"
        },
        {
          "id": "option_3",
          "text": "Third suggested answer", 
          "icon": "🌟"
        },
        {
          "id": "custom",
          "text": "${language === 'hi' ? 'अपना जवाब लिखें...' : 'Write your own answer...'}",
          "icon": "✏️"
        }
      ]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert marriage counselor and relationship advisor. Generate thoughtful, personalized questions based on user preferences. For each question, provide 3-4 relevant suggested answers that users can quickly select from, plus an option to write their own answer. Make the suggested answers diverse and representative of different perspectives. ALWAYS respond with valid JSON only - no additional text, explanations, or markdown code blocks. Return ONLY the raw JSON object."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Log the raw response for debugging
    console.log('Raw AI response:', response);

    // Parse the JSON response
    let questions;
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = response.trim();
      
      // Remove ```json and ``` markers
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
      cleanedResponse = cleanedResponse.replace(/^```\s*/i, '');
      cleanedResponse = cleanedResponse.replace(/\s*```$/i, '');
      cleanedResponse = cleanedResponse.trim();
      
      // Try to extract JSON from the response (in case AI adds extra text)
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;
      
      questions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response);
      console.error('Parse error:', parseError);
      throw new Error('Invalid response format from AI');
    }

    // Validate the response structure
    if (!questions || typeof questions !== 'object') {
      console.error('Invalid questions structure:', questions);
      throw new Error('Invalid response format from AI');
    }

    // Ensure questions array exists
    if (!Array.isArray(questions.questions)) {
      console.error('Questions array not found in response:', questions);
      throw new Error('Invalid response format from AI');
    }

    // Validate each question has required fields
    const validQuestions = questions.questions.filter((q: any) => 
      q.id && q.question && q.category && q.importance && Array.isArray(q.suggestedAnswers)
    );

    if (validQuestions.length === 0) {
      console.error('No valid questions found in response:', questions);
      throw new Error('Invalid response format from AI');
    }

    return NextResponse.json({ questions: validQuestions });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
} 