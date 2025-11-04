import { NextResponse } from 'next/server';

export async function GET() {
  // Only enable in development or with a special debug token
  if (process.env.NODE_ENV !== 'development' && 
      process.env.ENABLE_DEBUG_ENDPOINT !== 'true') {
    return NextResponse.json({ error: 'Debug endpoint disabled in production' }, { status: 403 });
  }

  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      // Check if environment variables exist without revealing values
      hasServerGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasPublicGoogleClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      // Show partial values for debugging
      serverGoogleClientIdPrefix: process.env.GOOGLE_CLIENT_ID ? 
        `${process.env.GOOGLE_CLIENT_ID.substring(0, 8)}...` : null,
      publicGoogleClientIdPrefix: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 
        `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.substring(0, 8)}...` : null,
      // Check domains
      authorizedDomains: [
        new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').hostname
      ]
    },
    timestamp: new Date().toISOString()
  });
} 