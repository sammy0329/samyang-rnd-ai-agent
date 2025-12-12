import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Supabase 클라이언트 생성 (쿠키 처리)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 확인 및 갱신
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // 보호된 라우트 (인증 필요)
  const protectedRoutes = ['/dashboard', '/trends', '/creators', '/content', '/profile'];

  // 인증 페이지 (로그인된 사용자 접근 불가)
  const authRoutes = ['/login', '/signup'];

  // 보호된 라우트에 비인증 사용자 접근 시 로그인 페이지로 리다이렉트
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 인증 페이지에 로그인된 사용자 접근 시 대시보드로 리다이렉트
  if (authRoutes.some((route) => pathname.startsWith(route)) && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // CORS 헤더 추가 (API 라우트용)
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'http://localhost:3000',
      process.env.NEXT_PUBLIC_APP_URL || '',
    ].filter(Boolean);

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
    }

    // Preflight 요청 처리
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
  }

  // 보안 헤더 추가
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
