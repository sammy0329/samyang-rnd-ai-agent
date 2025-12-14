'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Creator } from '@/types/creators';

interface CreatorCardProps {
  creator: Creator;
  onViewDetail: (creator: Creator) => void;
  onDelete?: (creator: Creator) => void;
  currentUserId?: string;
}

// 플랫폼별 정보 (아이콘, 색상)
const getPlatformInfo = (platform: 'tiktok' | 'instagram' | 'youtube') => {
  switch (platform) {
    case 'youtube':
      return {
        icon: '📹',
        label: 'YouTube',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      };
    case 'tiktok':
      return {
        icon: '🎵',
        label: 'TikTok',
        color: 'text-black',
        bgColor: 'bg-gray-50',
      };
    case 'instagram':
      return {
        icon: '📱',
        label: 'Instagram',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
      };
  }
};

// 숫자 포맷팅 (예: 1000000 -> 1M)
const formatNumber = (num: number | null): string => {
  if (num === null) return 'N/A';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// 점수에 따른 색상
const getScoreColor = (score: number | null): string => {
  if (score === null) return 'bg-gray-200';
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

// 점수 뱃지 색상
const getScoreBadgeColor = (score: number | null): string => {
  if (score === null) return 'bg-gray-100 text-gray-700';
  if (score >= 80) return 'bg-green-100 text-green-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700';
  if (score >= 40) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
};

export function CreatorCard({ creator, onViewDetail, onDelete, currentUserId }: CreatorCardProps) {
  const platformInfo = getPlatformInfo(creator.platform);
  const brandFitScore = creator.brand_fit_score || 0;

  // 삭제 버튼 표시: onDelete가 있으면 표시 (서버에서 권한 체크)
  const canDelete = !!onDelete;

  return (
    <Card
      className="group relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
      onClick={() => onViewDetail(creator)}
    >
      {/* 삭제 버튼 - 우측 상단 */}
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(creator);
          }}
          className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 hover:shadow-md"
          title="삭제"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      <div className="p-6">
        {/* 헤더: 플랫폼 + 사용자명 */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${platformInfo.bgColor} ${platformInfo.color}`}
              >
                <span className="mr-1">{platformInfo.icon}</span>
                {platformInfo.label}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {creator.username}
            </h3>
            {creator.content_category && (
              <p className="mt-1 text-sm text-gray-500">
                {creator.content_category}
              </p>
            )}
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">팔로워</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatNumber(creator.follower_count)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">평균 조회수</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatNumber(creator.avg_views)}
            </p>
          </div>
          {creator.engagement_rate !== null && (
            <div>
              <p className="text-xs text-gray-500">참여율</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {creator.engagement_rate.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* 브랜드 적합도 점수 */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              브랜드 적합도
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-sm font-bold ${getScoreBadgeColor(brandFitScore)}`}
            >
              {brandFitScore}점
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all ${getScoreColor(brandFitScore)}`}
              style={{ width: `${brandFitScore}%` }}
            />
          </div>
        </div>

        {/* 톤앤매너 */}
        {creator.tone_manner && (
          <div className="mb-4">
            <p className="mb-1 text-xs text-gray-500">톤앤매너</p>
            <p className="text-sm text-gray-700 line-clamp-2">
              {creator.tone_manner}
            </p>
          </div>
        )}

        {/* 마지막 분석 시간 */}
        {creator.last_analyzed_at && (
          <div className="mb-4 text-xs text-gray-400">
            마지막 분석:{' '}
            {new Date(creator.last_analyzed_at).toLocaleDateString('ko-KR')}
          </div>
        )}

        {/* 액션 버튼 */}
        <div>
          <a
            href={creator.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
              프로필 방문
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
}
