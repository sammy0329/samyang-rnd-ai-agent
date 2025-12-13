'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signupSchema, type SignupInput } from '@/types/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VerificationCodeInput } from './VerificationCodeInput';
import { sendSignUpOtp, verifySignUpOtp } from '@/lib/auth/client';

type SignupStep = 'info' | 'verification';

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [step, setStep] = useState<SignupStep>('info');
  const [email, setEmail] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const sendVerificationCode = async (data: SignupInput) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Supabase OTP 전송 (자동으로 이메일 발송)
      const { error } = await sendSignUpOtp(data.email, { name: data.name });

      if (error) {
        setErrorMessage(error.message || '인증 코드 전송에 실패했습니다.');
        return;
      }

      setEmail(data.email);
      setStep('verification');
    } catch (error) {
      setErrorMessage('인증 코드 전송 중 오류가 발생했습니다.');
      console.error('Send verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (code: string) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Supabase OTP 검증
      const { data: user, error } = await verifySignUpOtp(email, code);

      if (error) {
        setErrorMessage(error.message || '인증 코드가 올바르지 않습니다.');
        return;
      }

      if (user) {
        setSuccessMessage('회원가입이 완료되었습니다! 대시보드로 이동합니다.');

        // 2초 후 대시보드로 이동 (이미 로그인된 상태)
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 2000);
      }
    } catch (error) {
      setErrorMessage('인증 중 오류가 발생했습니다.');
      console.error('Verify code error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    sendSignUpOtp(email).then(({ error }) => {
      if (error) {
        setErrorMessage('재전송에 실패했습니다.');
      }
    });
  };

  // 인증 코드 입력 단계
  if (step === 'verification' && email) {
    return (
      <div className="space-y-6">
        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="shrink-0">
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
              <div className="shrink-0">
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

        <VerificationCodeInput
          email={email}
          onSubmit={verifyCode}
          onResend={handleResendCode}
          isLoading={isLoading}
        />

        <div className="text-center">
          <button
            type="button"
            onClick={() => setStep('info')}
            className="text-sm text-gray-600 hover:text-gray-900"
            disabled={isLoading}
          >
            ← 이전으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 회원가입 정보 입력 단계
  return (
    <form onSubmit={handleSubmit(sendVerificationCode)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">회원가입</h2>
        <p className="mt-2 text-sm text-gray-600">새 계정을 만드세요</p>
      </div>

      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="shrink-0">
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
            비밀번호 (선택)
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
          <p className="mt-1 text-xs text-gray-500">OTP 인증만 사용하려면 비워두세요</p>
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
        {isLoading ? '전송 중...' : '인증 코드 받기'}
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
