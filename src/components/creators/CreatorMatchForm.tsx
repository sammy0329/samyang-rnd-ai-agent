'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

// Form input schema (before transformation)
const creatorMatchFormSchema = z.object({
  username: z.string().min(1, '크리에이터명을 입력해주세요').max(100),
  platform: z.enum(['youtube', 'tiktok', 'instagram'], {
    message: '플랫폼을 선택해주세요',
  }),
  profileUrl: z.string().url('올바른 URL을 입력해주세요'),
  followerCount: z.string().optional(),
  avgViews: z.string().optional(),
  engagementRate: z.string().optional(),
  contentCategory: z.string().max(100).optional(),
  toneManner: z.string().max(500).optional(),
  campaignGoal: z.string().max(500).optional(),
  targetAudience: z.string().max(500).optional(),
  keyMessages: z.string().max(1000).optional(),
});

type CreatorMatchFormData = z.infer<typeof creatorMatchFormSchema>;

interface CreatorMatchFormProps {
  onSuccess?: (result: any) => void;
  onCancel?: () => void;
}

export function CreatorMatchForm({ onSuccess, onCancel }: CreatorMatchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatorMatchFormData>({
    resolver: zodResolver(creatorMatchFormSchema),
    defaultValues: {
      username: '',
      platform: 'youtube',
      profileUrl: '',
      followerCount: '',
      avgViews: '',
      engagementRate: '',
      contentCategory: '',
      toneManner: '',
      campaignGoal: '',
      targetAudience: '',
      keyMessages: '',
    },
  });

  const onSubmit = async (data: CreatorMatchFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert string inputs to numbers where applicable
      const payload = {
        username: data.username,
        platform: data.platform,
        profileUrl: data.profileUrl,
        followerCount:
          data.followerCount && data.followerCount !== ''
            ? Number(data.followerCount)
            : undefined,
        avgViews:
          data.avgViews && data.avgViews !== '' ? Number(data.avgViews) : undefined,
        engagementRate:
          data.engagementRate && data.engagementRate !== ''
            ? Number(data.engagementRate)
            : undefined,
        contentCategory: data.contentCategory || undefined,
        toneManner: data.toneManner || undefined,
        campaignInfo: {
          campaignGoal: data.campaignGoal || undefined,
          targetAudience: data.targetAudience || undefined,
          keyMessages: data.keyMessages || undefined,
        },
      };

      const response = await axios.post('/api/creators/match', payload);

      if (response.data.success) {
        reset();
        onSuccess?.(response.data.data);
      } else {
        setError('크리에이터 매칭에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Creator match error:', err);
      setError(
        err.response?.data?.error || '크리에이터 매칭 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 기본 정보 섹션 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">기본 정보</h3>

        {/* 크리에이터명 */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            크리에이터명 <span className="text-red-500">*</span>
          </label>
          <Input
            id="username"
            type="text"
            placeholder="예: @creator_name"
            className="mt-1"
            {...register('username')}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>

        {/* 플랫폼 */}
        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
            플랫폼 <span className="text-red-500">*</span>
          </label>
          <select
            id="platform"
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('platform')}
          >
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
          </select>
          {errors.platform && (
            <p className="mt-1 text-sm text-red-600">{errors.platform.message}</p>
          )}
        </div>

        {/* 프로필 URL */}
        <div>
          <label htmlFor="profileUrl" className="block text-sm font-medium text-gray-700">
            프로필 URL <span className="text-red-500">*</span>
          </label>
          <Input
            id="profileUrl"
            type="url"
            placeholder="https://www.youtube.com/@creator"
            className="mt-1"
            {...register('profileUrl')}
          />
          {errors.profileUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.profileUrl.message}</p>
          )}
        </div>
      </div>

      {/* 통계 정보 섹션 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">통계 정보 (선택사항)</h3>

        <div className="grid gap-4 md:grid-cols-3">
          {/* 팔로워 수 */}
          <div>
            <label
              htmlFor="followerCount"
              className="block text-sm font-medium text-gray-700"
            >
              팔로워 수
            </label>
            <Input
              id="followerCount"
              type="number"
              min="0"
              placeholder="예: 100000"
              className="mt-1"
              {...register('followerCount')}
            />
            {errors.followerCount && (
              <p className="mt-1 text-sm text-red-600">{errors.followerCount.message}</p>
            )}
          </div>

          {/* 평균 조회수 */}
          <div>
            <label htmlFor="avgViews" className="block text-sm font-medium text-gray-700">
              평균 조회수
            </label>
            <Input
              id="avgViews"
              type="number"
              min="0"
              placeholder="예: 50000"
              className="mt-1"
              {...register('avgViews')}
            />
            {errors.avgViews && (
              <p className="mt-1 text-sm text-red-600">{errors.avgViews.message}</p>
            )}
          </div>

          {/* 참여율 */}
          <div>
            <label
              htmlFor="engagementRate"
              className="block text-sm font-medium text-gray-700"
            >
              참여율 (%)
            </label>
            <Input
              id="engagementRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="예: 5.2"
              className="mt-1"
              {...register('engagementRate')}
            />
            {errors.engagementRate && (
              <p className="mt-1 text-sm text-red-600">{errors.engagementRate.message}</p>
            )}
          </div>
        </div>

        {/* 콘텐츠 카테고리 */}
        <div>
          <label
            htmlFor="contentCategory"
            className="block text-sm font-medium text-gray-700"
          >
            콘텐츠 카테고리
          </label>
          <Input
            id="contentCategory"
            type="text"
            placeholder="예: 먹방, 챌린지, 리뷰"
            className="mt-1"
            {...register('contentCategory')}
          />
          {errors.contentCategory && (
            <p className="mt-1 text-sm text-red-600">{errors.contentCategory.message}</p>
          )}
        </div>

        {/* 톤앤매너 */}
        <div>
          <label htmlFor="toneManner" className="block text-sm font-medium text-gray-700">
            톤앤매너
          </label>
          <textarea
            id="toneManner"
            rows={3}
            placeholder="크리에이터의 톤앤매너를 간단히 설명해주세요"
            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('toneManner')}
          />
          {errors.toneManner && (
            <p className="mt-1 text-sm text-red-600">{errors.toneManner.message}</p>
          )}
        </div>
      </div>

      {/* 캠페인 정보 섹션 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">캠페인 정보 (선택사항)</h3>

        {/* 캠페인 목표 */}
        <div>
          <label
            htmlFor="campaignGoal"
            className="block text-sm font-medium text-gray-700"
          >
            캠페인 목표
          </label>
          <Input
            id="campaignGoal"
            type="text"
            placeholder="예: 신제품 인지도 향상"
            className="mt-1"
            {...register('campaignGoal')}
          />
          {errors.campaignGoal && (
            <p className="mt-1 text-sm text-red-600">{errors.campaignGoal.message}</p>
          )}
        </div>

        {/* 타겟 오디언스 */}
        <div>
          <label
            htmlFor="targetAudience"
            className="block text-sm font-medium text-gray-700"
          >
            타겟 오디언스
          </label>
          <Input
            id="targetAudience"
            type="text"
            placeholder="예: 20-30대 여성"
            className="mt-1"
            {...register('targetAudience')}
          />
          {errors.targetAudience && (
            <p className="mt-1 text-sm text-red-600">{errors.targetAudience.message}</p>
          )}
        </div>

        {/* 핵심 메시지 */}
        <div>
          <label
            htmlFor="keyMessages"
            className="block text-sm font-medium text-gray-700"
          >
            핵심 메시지
          </label>
          <textarea
            id="keyMessages"
            rows={3}
            placeholder="캠페인에서 전달하고자 하는 핵심 메시지를 입력해주세요"
            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('keyMessages')}
          />
          {errors.keyMessages && (
            <p className="mt-1 text-sm text-red-600">{errors.keyMessages.message}</p>
          )}
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? '분석 중...' : '크리에이터 매칭 시작'}
        </Button>
      </div>
    </form>
  );
}
