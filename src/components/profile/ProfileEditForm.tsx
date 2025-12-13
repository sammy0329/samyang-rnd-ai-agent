'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/types/schemas';
import { AuthUser, updateProfile } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProfileEditFormProps {
  user: AuthUser;
  onUpdate: (user: AuthUser) => void;
}

export function ProfileEditForm({ user, onUpdate }: ProfileEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user.name || '',
    },
  });

  const onSubmit = async (data: ProfileUpdateInput) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { data: updatedUser, error } = await updateProfile({ name: data.name });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (updatedUser) {
        setSuccessMessage('프로필이 성공적으로 업데이트되었습니다.');
        onUpdate(updatedUser);

        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      setErrorMessage('프로필 업데이트 중 오류가 발생했습니다.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">프로필 정보</h3>
        <p className="mt-1 text-sm text-gray-600">
          이름을 변경할 수 있습니다. 이메일은 변경할 수 없습니다.
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="mt-1 bg-gray-100"
          />
          <p className="mt-1 text-xs text-gray-500">이메일은 변경할 수 없습니다.</p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            이름
          </label>
          <Input
            id="name"
            type="text"
            placeholder="이름을 입력하세요"
            {...register('name')}
            className="mt-1"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '저장 중...' : '변경사항 저장'}
        </Button>
      </div>
    </form>
  );
}
