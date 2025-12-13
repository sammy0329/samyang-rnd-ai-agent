import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting map (in-memory for demo, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS || '100',
  10
);
const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || '900000',
  10
); // 15 minutes

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // CORS configuration
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'https://samyang-rnd-ai-agent.vercel.app', // Production domain
  ];

  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const userLimit = rateLimitMap.get(ip);

    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
          return new NextResponse(
            JSON.stringify({
              error: 'Too many requests. Please try again later.',
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(
                  Math.ceil((userLimit.resetTime - now) / 1000)
                ),
              },
            }
          );
        }
        userLimit.count += 1;
      } else {
        // Reset the limit
        rateLimitMap.set(ip, {
          count: 1,
          resetTime: now + RATE_LIMIT_WINDOW_MS,
        });
      }
    } else {
      // First request from this IP
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW_MS,
      });
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS));
    response.headers.set(
      'X-RateLimit-Remaining',
      String(RATE_LIMIT_MAX_REQUESTS - (rateLimitMap.get(ip)?.count || 0))
    );
    response.headers.set(
      'X-RateLimit-Reset',
      String(rateLimitMap.get(ip)?.resetTime || now + RATE_LIMIT_WINDOW_MS)
    );
  }

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
