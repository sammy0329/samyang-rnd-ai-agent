/**
 * Client-side Authentication Functions
 *
 * 클라이언트 컴포넌트에서 사용하는 인증 함수들
 * - 회원가입, 로그인, 로그아웃
 * - 세션 확인
 */

import { createClient } from '@/lib/db/client';

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
 * 이메일 OTP 전송 (회원가입용)
 * Supabase가 자동으로 6자리 코드를 생성하고 이메일로 전송합니다
 */
export async function sendSignUpOtp(
  email: string,
  metadata?: { name?: string }
): Promise<AuthResponse<void>> {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: metadata,
      },
    });

    if (error) {
      throw error;
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Send OTP error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to send OTP'),
    };
  }
}

/**
 * OTP 검증 및 회원가입 완료
 */
export async function verifySignUpOtp(
  email: string,
  token: string
): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    // OTP 검증 및 자동 로그인
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Verification failed');
    }

    // users 테이블에서 사용자 정보 조회
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (dbError) {
      console.error('Failed to fetch user profile:', dbError);
    }

    const user: AuthUser = {
      id: authData.user.id,
      email: authData.user.email!,
      name: userData?.name || authData.user.user_metadata?.name,
      role: userData?.role || 'user',
      created_at: userData?.created_at || authData.user.created_at,
    };

    return { data: user, error: null };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Verification failed'),
    };
  }
}

/**
 * 회원가입 (비밀번호 방식 - 레거시)
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  try {
    const supabase = createClient();

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

    // users 테이블은 database trigger가 자동으로 생성함
    // (handle_new_user trigger)

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
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  try {
    const supabase = createClient();

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

    let userData = null;

    // users 테이블에서 프로필 조회
    const { data: existingUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (dbError && dbError.code === 'PGRST116') {
      // 프로필이 없으면 자동 생성
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.user_metadata?.name || authData.user.email!.split('@')[0],
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
      id: authData.user.id,
      email: authData.user.email!,
      name: userData?.name || authData.user.user_metadata?.name || authData.user.email!.split('@')[0],
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
 */
export async function getSession(): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    // getUser()를 사용하여 안전하게 사용자 정보 가져오기
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    if (!authUser) {
      return { data: null, error: null };
    }

    let userData = null;

    // users 테이블에서 프로필 조회
    const { data: existingUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (dbError && dbError.code === 'PGRST116') {
      // 프로필이 없으면 자동 생성
      const { data: newUser, error: createError } = await supabase
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
    console.error('Get session error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get session'),
    };
  }
}

/**
 * 현재 사용자 정보 조회 (Client)
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  return getSession();
}

/**
 * 프로필 업데이트 (이름 변경)
 */
export async function updateProfile(data: { name: string }): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    // 현재 사용자 확인
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Supabase Auth user_metadata 업데이트
    const { error: authError } = await supabase.auth.updateUser({
      data: { name: data.name },
    });

    if (authError) {
      throw authError;
    }

    // users 테이블 업데이트
    const { error: dbError } = await supabase
      .from('users')
      .update({ name: data.name })
      .eq('id', currentUser.id);

    if (dbError) {
      throw dbError;
    }

    // 업데이트된 사용자 정보 조회
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    const user: AuthUser = {
      id: currentUser.id,
      email: currentUser.email!,
      name: userData?.name || data.name,
      role: userData?.role || 'user',
      created_at: userData?.created_at || currentUser.created_at,
    };

    return { data: user, error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update profile'),
    };
  }
}

/**
 * 비밀번호 변경
 */
export async function updatePassword(newPassword: string): Promise<AuthResponse<void>> {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update password'),
    };
  }
}
