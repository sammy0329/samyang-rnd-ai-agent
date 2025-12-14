'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Form validation schema
const ContentGenerationFormSchema = z.object({
  brandCategory: z.enum(['buldak', 'samyang_ramen', 'jelly'], {
    message: '브랜드 카테고리를 선택해주세요',
  }),
  tone: z.enum(['fun', 'kawaii', 'provocative', 'cool'], {
    message: '톤앤매너를 선택해주세요',
  }),
  targetCountry: z.enum(['KR', 'US', 'JP'], {
    message: '타깃 국가를 선택해주세요',
  }),
  preferredPlatform: z.enum(['tiktok', 'instagram', 'youtube']).optional(),
  additionalRequirements: z.string().max(1000).optional(),
});

type ContentGenerationFormData = z.infer<typeof ContentGenerationFormSchema>;

interface ContentIdea {
  id: string;
  title: string;
  brand_category: string;
  tone: string;
  hook_text: string;
  scene_structure: Record<string, unknown>;
  editing_format: string;
  music_style: string;
  props_needed: string[];
  target_country: string;
  expected_performance: Record<string, unknown>;
  created_at: string;
}

interface ContentGenerationFormProps {
  onSuccess: (ideas: ContentIdea[]) => void;
  onError?: (error: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function ContentGenerationForm({
  onSuccess,
  onError,
  onLoadingChange,
}: ContentGenerationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContentGenerationFormData>({
    resolver: zodResolver(ContentGenerationFormSchema),
  });

  const onSubmit = async (data: ContentGenerationFormData) => {
    setIsSubmitting(true);
    setError(null);
    onLoadingChange?.(true);

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate content ideas');
      }

      if (result.success && result.data.ideas) {
        onSuccess(result.data.ideas);
        reset();
      } else {
        throw new Error('No ideas generated');
      }
    } catch (err) {
      console.error('Content generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <Card className="mb-8 p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        콘텐츠 아이디어 생성
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 브랜드 카테고리 선택 */}
        <div>
          <label
            htmlFor="brandCategory"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            브랜드 카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            id="brandCategory"
            {...register('brandCategory')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          >
            <option value="">선택하세요</option>
            <option value="buldak">불닭볶음면</option>
            <option value="samyang_ramen">삼양라면</option>
            <option value="jelly">젤리</option>
          </select>
          {errors.brandCategory && (
            <p className="mt-1 text-sm text-red-500">
              {errors.brandCategory.message}
            </p>
          )}
        </div>

        {/* 톤앤매너 선택 */}
        <div>
          <label
            htmlFor="tone"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            톤앤매너 <span className="text-red-500">*</span>
          </label>
          <select
            id="tone"
            {...register('tone')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          >
            <option value="">선택하세요</option>
            <option value="fun">재미/유머</option>
            <option value="kawaii">카와이/귀여움</option>
            <option value="provocative">도발적/자극적</option>
            <option value="cool">쿨/세련됨</option>
          </select>
          {errors.tone && (
            <p className="mt-1 text-sm text-red-500">{errors.tone.message}</p>
          )}
        </div>

        {/* 타깃 국가 선택 */}
        <div>
          <label
            htmlFor="targetCountry"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            타깃 국가 <span className="text-red-500">*</span>
          </label>
          <select
            id="targetCountry"
            {...register('targetCountry')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          >
            <option value="">선택하세요</option>
            <option value="KR">한국</option>
            <option value="US">미국</option>
            <option value="JP">일본</option>
          </select>
          {errors.targetCountry && (
            <p className="mt-1 text-sm text-red-500">
              {errors.targetCountry.message}
            </p>
          )}
        </div>

        {/* 플랫폼 선택 (옵션) */}
        <div>
          <label
            htmlFor="preferredPlatform"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            선호 플랫폼 (옵션)
          </label>
          <select
            id="preferredPlatform"
            {...register('preferredPlatform')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          >
            <option value="">선택하세요</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
          </select>
          {errors.preferredPlatform && (
            <p className="mt-1 text-sm text-red-500">
              {errors.preferredPlatform.message}
            </p>
          )}
        </div>

        {/* 추가 요구사항 (옵션) */}
        <div>
          <label
            htmlFor="additionalRequirements"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            추가 요구사항 (옵션)
          </label>
          <textarea
            id="additionalRequirements"
            {...register('additionalRequirements')}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="예: 제품을 직접 먹는 장면 포함, 챌린지 형식으로 구성 등"
            disabled={isSubmitting}
          />
          {errors.additionalRequirements && (
            <p className="mt-1 text-sm text-red-500">
              {errors.additionalRequirements.message}
            </p>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
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
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 생성 버튼 */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? '생성 중...' : '아이디어 생성 (3개)'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
