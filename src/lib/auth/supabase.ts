/**
 * Supabase Authentication Helper Functions
 *
 * 이 파일은 Supabase Auth를 사용한 인증 관련 헬퍼 함수를 제공합니다.
 * - 회원가입 (signUp)
 * - 로그인 (signIn)
 * - 로그아웃 (signOut)
 * - 세션 확인 (getSession)
 * - 사용자 정보 조회 (getCurrentUser)
 */

import { createClient } from '@/lib/db/client';
import { createServerSupabaseClient } from '@/lib/db/client';

// ===========================
// Types
// ===========================

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

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
// Client-side Auth Functions
// ===========================

/**
 * 회원가입
 *
 * @param data - 회원가입 정보 (email, password, name)
 * @returns AuthResponse - 성공 시 사용자 정보, 실패 시 에러
 *
 * @example
 * const { data, error } = await signUp({
 *   email: 'user@example.com',
 *   password: 'securepassword',
 *   name: 'John Doe'
 * });
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    // 1. Supabase Auth에 사용자 등록
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name || '',
        },
      },
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    // 2. users 테이블에 추가 정보 저장
    const { error: dbError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: data.email,
      name: data.name || null,
      role: 'user', // 기본 역할
    });

    if (dbError) {
      console.error('Failed to create user profile:', dbError);
      // Auth 사용자는 생성되었지만 프로필 생성 실패
      // 실제 프로덕션에서는 Auth 사용자도 삭제해야 할 수 있음
    }

    // 3. 사용자 정보 반환
    const user: AuthUser = {
      id: authData.user.id,
      email: authData.user.email!,
      name: data.name,
      role: 'user',
      created_at: authData.user.created_at,
    };

    return { data: user, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Sign up failed'),
    };
  }
}

/**
 * 로그인
 *
 * @param data - 로그인 정보 (email, password)
 * @returns AuthResponse - 성공 시 사용자 정보, 실패 시 에러
 *
 * @example
 * const { data, error } = await signIn({
 *   email: 'user@example.com',
 *   password: 'securepassword'
 * });
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    // 1. Supabase Auth로 로그인
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Login failed');
    }

    // 2. users 테이블에서 추가 정보 조회
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (dbError) {
      console.error('Failed to fetch user profile:', dbError);
    }

    // 3. 사용자 정보 반환
    const user: AuthUser = {
      id: authData.user.id,
      email: authData.user.email!,
      name: userData?.name || authData.user.user_metadata?.name,
      role: userData?.role || 'user',
      created_at: userData?.created_at || authData.user.created_at,
    };

    return { data: user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Login failed'),
    };
  }
}

/**
 * 로그아웃
 *
 * @returns AuthResponse<void> - 성공 시 null, 실패 시 에러
 *
 * @example
 * const { error } = await signOut();
 * if (!error) {
 *   router.push('/login');
 * }
 */
export async function signOut(): Promise<AuthResponse<void>> {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Logout failed'),
    };
  }
}

/**
 * 현재 세션 확인 (Client)
 *
 * @returns AuthResponse - 로그인된 경우 사용자 정보, 아니면 null
 *
 * @example
 * const { data: user } = await getSession();
 * if (user) {
 *   console.log('Logged in as:', user.email);
 * }
 */
export async function getSession(): Promise<AuthResponse> {
  try {
    const supabase = createClient();

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

    // users 테이블에서 추가 정보 조회
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
    console.error('Get session error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get session'),
    };
  }
}

/**
 * 현재 사용자 정보 조회 (Client)
 *
 * @returns AuthResponse - 로그인된 경우 사용자 정보, 아니면 null
 *
 * @example
 * const { data: user } = await getCurrentUser();
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  return getSession();
}

// ===========================
// Server-side Auth Functions
// ===========================

/**
 * 현재 세션 확인 (Server)
 *
 * Server Components나 API Routes에서 사용
 *
 * @returns AuthResponse - 로그인된 경우 사용자 정보, 아니면 null
 *
 * @example
 * // Server Component
 * const { data: user } = await getServerSession();
 * if (!user) {
 *   redirect('/login');
 * }
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

    // users 테이블에서 추가 정보 조회
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
 *
 * @returns AuthResponse - 로그인된 경우 사용자 정보, 아니면 null
 *
 * @example
 * // Server Component
 * const { data: user } = await getServerUser();
 */
export async function getServerUser(): Promise<AuthResponse> {
  return getServerSession();
}

/**
 * 관리자 권한 확인
 *
 * @returns boolean - Admin 권한 여부
 *
 * @example
 * const isAdmin = await checkIsAdmin();
 * if (!isAdmin) {
 *   return new Response('Forbidden', { status: 403 });
 * }
 */
export async function checkIsAdmin(): Promise<boolean> {
  const { data: user } = await getServerSession();
  return user?.role === 'admin';
}

/**
 * 인증 확인 (Server)
 *
 * 미인증 시 에러 발생
 *
 * @throws Error - 인증되지 않은 경우
 * @returns AuthUser - 인증된 사용자 정보
 *
 * @example
 * // API Route
 * try {
 *   const user = await requireAuth();
 *   // 인증된 사용자만 여기 도달
 * } catch (error) {
 *   return new Response('Unauthorized', { status: 401 });
 * }
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
 *
 * @throws Error - Admin이 아닌 경우
 * @returns AuthUser - Admin 사용자 정보
 *
 * @example
 * // API Route
 * try {
 *   const admin = await requireAdmin();
 *   // Admin만 여기 도달
 * } catch (error) {
 *   return new Response('Forbidden', { status: 403 });
 * }
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();

  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}
