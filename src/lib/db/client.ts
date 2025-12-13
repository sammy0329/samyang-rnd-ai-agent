import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Client (클라이언트 컴포넌트용)
 *
 * Client Components에서 사용하는 Supabase 클라이언트
 * - 브라우저 환경에서 실행
 * - 쿠키 기반 세션 자동 관리
 * - RLS 정책 적용
 *
 * @example
 * 'use client';
 * import { createClient } from '@/lib/db/client';
 *
 * const supabase = createClient();
 * const { data } = await supabase.from('trends').select('*');
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
