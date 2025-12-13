/**
 * Server-side Authentication Functions
 *
 * 서버 컴포넌트와 API Routes에서 사용하는 인증 함수들
 */

import { createServerSupabaseClient } from '@/lib/db/server';

// ===========================
// Types
// ===========================

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
}

export interface AuthResponse<T = AuthUser> {
  data: T | null;
  error: Error | null;
}

// ===========================
// Server-side Auth Functions
// ===========================

/**
 * 현재 세션 확인 (Server)
 *
 * Server Components나 API Routes에서 사용
 */
export async function getServerSession(): Promise<AuthResponse> {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!session?.user) {
      return { data: null, error: null };
    }

    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (dbError) {
      console.error('Failed to fetch user profile:', dbError);
    }

    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email!,
      name: userData?.name || session.user.user_metadata?.name,
      role: userData?.role || 'user',
      created_at: userData?.created_at || session.user.created_at,
    };

    return { data: user, error: null };
  } catch (error) {
    console.error('Get server session error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get session'),
    };
  }
}

/**
 * 현재 사용자 정보 조회 (Server)
 */
export async function getServerUser(): Promise<AuthResponse> {
  return getServerSession();
}

/**
 * 관리자 권한 확인
 */
export async function checkIsAdmin(): Promise<boolean> {
  const { data: user } = await getServerSession();
  return user?.role === 'admin';
}

/**
 * 인증 확인 (Server)
 *
 * 미인증 시 에러 발생
 */
export async function requireAuth(): Promise<AuthUser> {
  const { data: user, error } = await getServerSession();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * 관리자 권한 확인 (Server)
 *
 * Admin이 아닌 경우 에러 발생
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();

  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}
