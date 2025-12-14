'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

// Zod 스키마 정의 (API 스키마와 동일)
const trendAnalysisSchema = z.object({
  keyword: z
    .string()
    .min(1, '키워드를 입력해주세요')
    .max(100, '키워드는 100자 이내로 입력해주세요'),
  platform: z.enum(['youtube', 'tiktok', 'instagram'], {
    message: '플랫폼을 선택해주세요',
  }),
  country: z.enum(['KR', 'US', 'JP']).default('KR'),
  additionalContext: z.string().optional(),
});

type TrendAnalysisFormData = z.infer<typeof trendAnalysisSchema>;

interface TrendAnalysisFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function TrendAnalysisForm({ onSuccess, onError }: TrendAnalysisFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(trendAnalysisSchema),
    defaultValues: {
      keyword: '',
      platform: 'youtube' as const,
      country: 'KR' as const,
      additionalContext: '',
    },
  });

  const onSubmit = async (data: TrendAnalysisFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await axios.post('/api/trends/analyze', data);

      if (response.data.success) {
        // 성공 콜백
        onSuccess?.(response.data.data);
        // 폼 초기화
        reset();
      } else {
        throw new Error(response.data.error || '분석 실패');
      }
    } catch (error) {
      console.error('Trend analysis error:', error);

      let errorMessage = '트렌드 분석 중 오류가 발생했습니다.';

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          errorMessage = '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setSubmitError(errorMessage);
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 키워드 입력 */}
      <div>
        <label htmlFor="keyword" className="mb-2 block text-sm font-medium text-gray-700">
          키워드 <span className="text-red-500">*</span>
        </label>
        <Input
          id="keyword"
          type="text"
          placeholder="예: 불닭볶음면, 삼양라면"
          {...register('keyword')}
          className={errors.keyword ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.keyword && (
          <p className="mt-1 text-sm text-red-600">{errors.keyword.message}</p>
        )}
      </div>

      {/* 플랫폼 선택 */}
      <div>
        <label htmlFor="platform" className="mb-2 block text-sm font-medium text-gray-700">
          플랫폼 <span className="text-red-500">*</span>
        </label>
        <select
          id="platform"
          {...register('platform')}
          className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.platform ? 'border-red-500' : 'border-input'
          }`}
          disabled={isSubmitting}
        >
          <option value="youtube">YouTube Shorts</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram Reels</option>
        </select>
        {errors.platform && (
          <p className="mt-1 text-sm text-red-600">{errors.platform.message}</p>
        )}
      </div>

      {/* 국가 선택 */}
      <div>
        <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-700">
          국가
        </label>
        <select
          id="country"
          {...register('country')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
        >
          <option value="KR">한국</option>
          <option value="US">미국</option>
          <option value="JP">일본</option>
        </select>
        {errors.country && (
          <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
        )}
      </div>

      {/* 추가 컨텍스트 (선택) */}
      <div>
        <label
          htmlFor="additionalContext"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          추가 컨텍스트 (선택)
        </label>
        <textarea
          id="additionalContext"
          {...register('additionalContext')}
          placeholder="분석에 도움이 될 추가 정보를 입력하세요 (예: 타겟 연령층, 특정 관심사 등)"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
          disabled={isSubmitting}
        />
        {errors.additionalContext && (
          <p className="mt-1 text-sm text-red-600">{errors.additionalContext.message}</p>
        )}
      </div>

      {/* 에러 메시지 */}
      {submitError && (
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
              <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
              <p className="mt-1 text-sm text-red-700">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* 제출 버튼 */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <svg
              className="mr-2 h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>분석 중...</span>
          </div>
        ) : (
          '트렌드 분석 시작'
        )}
      </Button>

      {/* 안내 메시지 */}
      <p className="text-center text-sm text-gray-500">
        분석은 약 5-10초 정도 소요됩니다
      </p>
    </form>
  );
}
