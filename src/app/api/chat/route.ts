import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const interviewQuestions = {
  personal: [
    "What is your name?",
    "How old are you?",
    "Where were you born and raised?",
    "What is your educational background?",
    "What do you do for a living?",
    "What are your hobbies and interests?",
    "How would you describe your personality?",
    "What are your strengths and weaknesses?",
    "What are your short-term and long-term goals?",
    "How do you spend your free time?"
  ],
  family: [
    "Tell me about your family background.",
    "What are your family values?",
    "How many siblings do you have?",
    "What is your relationship with your parents?",
    "What role does family play in your life?",
    "How do you handle family responsibilities?",
    "What are your views on joint family vs nuclear family?",
    "How do you maintain work-life balance?",
    "What are your expectations from your future family?",
    "How do you handle family conflicts?"
  ],
  relationship: [
    "What are you looking for in a life partner?",
    "What are your deal-breakers in a relationship?",
    "How do you handle conflicts in a relationship?",
    "What are your expectations from marriage?",
    "How important is compatibility to you?",
    "What role does communication play in your relationships?",
    "How do you express love and affection?",
    "What are your views on trust and loyalty?",
    "How do you handle differences in opinions?",
    "What are your thoughts on personal space in a relationship?"
  ],
  lifestyle: [
    "What is your daily routine like?",
    "How do you maintain your health and fitness?",
    "What are your dietary preferences?",
    "Do you have any religious or spiritual beliefs?",
    "How do you handle stress and pressure?",
    "What are your views on social media and technology?",
    "How do you manage your finances?",
    "What are your travel preferences?",
    "How do you celebrate special occasions?",
    "What are your views on work-life balance?"
  ],
  future: [
    "Where do you see yourself in 5 years?",
    "What are your career aspirations?",
    "How do you plan to grow personally and professionally?",
    "What are your views on having children?",
    "How do you envision your ideal married life?",
    "What are your financial goals?",
    "How do you plan to maintain relationships with both families?",
    "What are your retirement plans?",
    "How do you want to contribute to society?",
    "What legacy do you want to leave behind?"
  ]
};

export async function POST(req: Request) {
  try {
    const { messages, language, interviewStep, category } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const isUserMessage = lastMessage.role === 'user';
    const questionIndex = Math.floor(messages.length / 2);

    let response = '';
    let interviewComplete = false;
    let nextCategory = category;

    if (interviewStep === 'welcome') {
      response = `Hello! I'm ब्रह्मांड AI. I'll be conducting your interview today. Let's start with some personal questions. What is your name?`;
      nextCategory = 'personal';
    } else if (interviewStep === 'questions') {
      const currentCategory = category || 'personal';
      const questions = interviewQuestions[currentCategory as keyof typeof interviewQuestions];
      
      if (!questions) {
        throw new Error('Invalid category');
      }

      if (questionIndex < questions.length) {
        const currentQuestion = questions[questionIndex];
        if (isUserMessage) {
          // Acknowledge the user's response
          response = `Thank you for sharing that. ${currentQuestion}`;
        } else {
          response = currentQuestion;
        }
      } else {
        // Move to next category or complete interview
        const categories = Object.keys(interviewQuestions);
        const currentIndex = categories.indexOf(currentCategory);
        
        if (currentIndex < categories.length - 1) {
          nextCategory = categories[currentIndex + 1];
          const nextQuestions = interviewQuestions[nextCategory as keyof typeof interviewQuestions];
          response = `Thank you for completing the ${currentCategory} questions. Let's move on to ${nextCategory} questions. ${nextQuestions[0]}`;
        } else {
          response = "Thank you for completing the interview! I'll analyze your responses and find compatible matches for you. Is there anything else you'd like to share?";
          interviewComplete = true;
        }
      }
    } else {
      // Regular chat mode
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 150
      });

      response = completion.choices[0].message.content || "I'm sorry, I couldn't process your request.";
    }

    return NextResponse.json({ 
      response,
      interviewComplete,
      category: nextCategory,
      currentQuestionIndex: questionIndex
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 