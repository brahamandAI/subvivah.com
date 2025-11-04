import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that require authentication for API routes only
const protectedApiPaths = [
  '/api/search',
  '/api/dating',
  '/api/matches',
  '/api/messages',
  '/api/kundli',
  '/api/brahmand-chat',
  '/api/user',
  '/api/profile',
  '/api/auth/me',
  '/api/auth/logout',
  '/api/users',
  '/api/profiles'
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Only protect API routes
  const isProtectedApiPath = protectedApiPaths.some(path => pathname.startsWith(path));

  if (isProtectedApiPath && !token) {
    // Return unauthorized for API routes
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized', isAuthenticated: false }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return NextResponse.next();
}

// Update the matcher configuration to include all protected paths
export const config = {
  matcher: [
    '/api/search/:path*',
    '/api/dating/:path*',
    '/api/matches/:path*',
    '/api/messages/:path*',
    '/api/kundli/:path*',
    '/api/brahmand-chat/:path*',
    '/api/user/:path*',
    '/api/profile/:path*',
    '/api/auth/me',
    '/api/auth/logout',
    '/api/users/:path*',
    '/api/profiles/:path*'
  ],
}; 