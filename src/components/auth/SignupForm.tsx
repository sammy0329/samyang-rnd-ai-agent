'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signupSchema, type SignupInput } from '@/types/schemas';
import { signUp } from '@/lib/auth/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { data: user, error } = await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (user) {
        setSuccessMessage(
          '회원가입이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요.'
        );

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error) {
      setErrorMessage('회원가입 중 오류가 발생했습니다.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">회원가입</h2>
        <p className="mt-2 text-sm text-gray-600">새 계정을 만드세요</p>
      </div>

      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            이름 (선택)
          </label>
          <Input
            id="name"
            type="text"
            placeholder="홍길동"
            {...register('name')}
            className="mt-1"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            className="mt-1"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className="mt-1"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">최소 8자 이상</p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            비밀번호 확인
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            className="mt-1"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? '회원가입 중...' : '회원가입'}
      </Button>

      <div className="text-center text-sm">
        <span className="text-gray-600">이미 계정이 있으신가요? </span>
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          로그인
        </Link>
      </div>
    </form>
  );
}
