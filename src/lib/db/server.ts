import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server Client (서버 컴포넌트 및 API 라우트용)
 *
 * Server Components와 API Routes에서 사용하는 Supabase 클라이언트
 * - 서버 환경에서 실행
 * - 쿠키 기반 세션 관리 (읽기/쓰기)
 * - RLS 정책 적용
 *
 * @example
 * // Server Component
 * import { createServerSupabaseClient } from '@/lib/db/server';
 *
 * const supabase = await createServerSupabaseClient();
 * const { data } = await supabase.from('trends').select('*');
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서는 쿠키 설정이 불가능할 수 있음
          }
        },
      },
    }
  );
}

/**
 * Admin Client (서비스 역할 - 모든 권한)
 *
 * Service Role Key를 사용하는 관리자 클라이언트
 * - 모든 RLS 정책 우회
 * - 데이터베이스 완전 제어 가능
 * - API Routes 내부에서만 사용 (보안 주의!)
 *
 * @example
 * // API Route
 * import { createAdminClient } from '@/lib/db/server';
 *
 * const supabase = createAdminClient();
 * const { data } = await supabase.from('api_usage').insert({ ... });
 *
 * @warning
 * 이 클라이언트는 RLS를 우회하므로 매우 조심해서 사용해야 합니다.
 * - 사용자 입력을 직접 쿼리에 사용하지 말 것
 * - API 라우트 내부에서만 사용
 * - 인증 검증 필수
 */
export function createAdminClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
