import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/config/api';

export async function POST(request: Request) {
  try {
    const { text, language } = await request.json();

    // First, create a talk
    const talkResponse = await fetch(API_CONFIG.DID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_CONFIG.DID_API_KEY}`,
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: text,
          provider: {
            type: 'microsoft',
            voice_id: 'en-US-JennyNeural', // Default to English, will be overridden by language
          },
        },
        source_url: 'https://storage.googleapis.com/d-id-avatars/avatar.mp4', // Your avatar source URL
      }),
    });

    if (!talkResponse.ok) {
      throw new Error('Failed to create D-ID talk');
    }

    const talkData = await talkResponse.json();
    const talkId = talkData.id;

    // Poll for the video URL
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!videoUrl && attempts < maxAttempts) {
      const statusResponse = await fetch(`${API_CONFIG.DID_API_URL}/${talkId}`, {
        headers: {
          'Authorization': `Basic ${API_CONFIG.DID_API_KEY}`,
        },
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to get talk status');
      }

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'done') {
        videoUrl = statusData.result_url;
        break;
      }

      // Wait for 1 second before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!videoUrl) {
      throw new Error('Failed to generate video URL');
    }

    return NextResponse.json({ videoUrl });
  } catch (error) {
    console.error('Error in D-ID API:', error);
    return NextResponse.json(
      { error: 'Failed to generate avatar video' },
      { status: 500 }
    );
  }
} 