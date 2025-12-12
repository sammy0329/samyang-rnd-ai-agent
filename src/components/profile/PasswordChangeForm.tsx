'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordChangeSchema, type PasswordChangeInput } from '@/types/schemas';
import { updatePassword } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PasswordChangeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSubmit = async (data: PasswordChangeInput) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await updatePassword(data.newPassword);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage('비밀번호가 성공적으로 변경되었습니다.');
      reset();

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrorMessage('비밀번호 변경 중 오류가 발생했습니다.');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">비밀번호 변경</h3>
        <p className="mt-1 text-sm text-gray-600">
          새로운 비밀번호를 입력하세요. 최소 8자 이상이어야 합니다.
        </p>
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

      <div className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            새 비밀번호
          </label>
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••••"
            {...register('newPassword')}
            className="mt-1"
            disabled={isLoading}
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            새 비밀번호 확인
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '변경 중...' : '비밀번호 변경'}
        </Button>
      </div>
    </form>
  );
}
