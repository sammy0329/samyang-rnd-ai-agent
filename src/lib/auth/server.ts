/**
 * Server-side Authentication Functions
 *
 * 서버 컴포넌트와 API Routes에서 사용하는 인증 함수들
 */

import { createServerSupabaseClient, createAdminClient } from '@/lib/db/server';

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

    // getUser()를 사용하여 안전하게 사용자 정보 가져오기
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    // 개발 환경에서 세션이 없을 때 기본 사용자 사용
    if (!authUser) {
      if (process.env.NODE_ENV === 'development' && process.env.DEV_DEFAULT_USER_ID) {
        // 개발 환경에서는 기본 사용자 ID 사용 (환경 변수로 설정)
        const defaultUserId = process.env.DEV_DEFAULT_USER_ID;
        const adminClient = createAdminClient();

        const { data: userData, error: dbError } = await adminClient
          .from('users')
          .select('*')
          .eq('id', defaultUserId)
          .single();

        if (!dbError && userData) {
          const user: AuthUser = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            created_at: userData.created_at,
          };
          console.log('[DEV] Using default user:', user.email);
          return { data: user, error: null };
        }
      }
      return { data: null, error: null };
    }

    // Use admin client to bypass RLS for user profile lookup
    const adminClient = createAdminClient();
    let userData = null;

    const { data: existingUser, error: dbError } = await adminClient
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (dbError && dbError.code === 'PGRST116') {
      // 프로필이 없으면 자동 생성
      const { data: newUser, error: createError } = await adminClient
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
          role: 'user',
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user profile:', createError);
      } else {
        userData = newUser;
      }
    } else if (dbError) {
      console.error('Failed to fetch user profile:', dbError);
    } else {
      userData = existingUser;
    }

    const user: AuthUser = {
      id: authUser.id,
      email: authUser.email!,
      name: userData?.name || authUser.user_metadata?.name || authUser.email!.split('@')[0],
      role: userData?.role || 'user',
      created_at: userData?.created_at || authUser.created_at,
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
