import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { clearCookieConfig } from '@/lib/auth';

export async function POST(request: Request) {
  console.log('🔄 Server-side logout process started');
  
  try {
    // 1. Get the cookie store
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    
    // 2. Create base response with no-cache headers
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
    
    // 3. Set strict no-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    // 4. Clear all authentication cookies with secure settings
    const cookiesToClear = ['token', 'google_token', 'session_state'];
    
    for (const cookieName of cookiesToClear) {
      response.cookies.set(cookieName, '', {
        ...clearCookieConfig,
        maxAge: 0,
        expires: new Date(0),
      });
    }
    
    // 5. If there's a valid token, invalidate the session
    if (token?.value) {
      try {
        const decoded = verifyJwt(token.value) as any;
        if (decoded?.userId) {
          // Log the user ID for audit purposes
          console.log('✅ Successfully logged out user:', decoded.userId);
        }
      } catch (error) {
        // Token verification failed, but we'll continue with logout
        console.warn('⚠️ Invalid token during logout:', error);
      }
    }
    
    console.log('✅ Server-side logout completed successfully');
    return response;
    
  } catch (error) {
    console.error('❌ Server-side logout error:', error);
    
    // Even if there's an error, try to clear cookies
    const response = NextResponse.json(
      { success: false, message: 'Logout failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    
    // Attempt to clear cookies even in error case
    const cookiesToClear = ['token', 'google_token', 'session_state'];
    for (const cookieName of cookiesToClear) {
      response.cookies.set(cookieName, '', {
        ...clearCookieConfig,
        maxAge: 0,
        expires: new Date(0),
      });
    }
    
    return response;
  }
} 