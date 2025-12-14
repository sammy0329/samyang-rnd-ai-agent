import { Trend } from '@/types/trends';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TrendCardProps {
  trend: Trend;
  onViewDetail?: (trend: Trend) => void;
  onGenerateIdea?: (trend: Trend) => void;
  onDelete?: (trend: Trend) => void;
  currentUserId?: string;
}

/**
 * 플랫폼 아이콘 및 이름 반환
 */
function getPlatformInfo(platform: string) {
  switch (platform) {
    case 'shorts':
      return {
        icon: '📹',
        name: 'YouTube Shorts',
        color: 'bg-red-100 text-red-700',
      };
    case 'tiktok':
      return {
        icon: '🎵',
        name: 'TikTok',
        color: 'bg-black text-white',
      };
    case 'reels':
      return {
        icon: '📱',
        name: 'Instagram Reels',
        color: 'bg-pink-100 text-pink-700',
      };
    default:
      return {
        icon: '🎬',
        name: platform,
        color: 'bg-gray-100 text-gray-700',
      };
  }
}

/**
 * 점수에 따른 색상 반환
 */
function getScoreColor(score: number) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString: string) {
  if (!dateString) return '알 수 없음';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // 유효하지 않은 날짜 체크
  if (isNaN(date.getTime())) {
    return '알 수 없음';
  }
  
  const diff = now.getTime() - date.getTime();
  
  // 미래 시간이면 "방금 전"으로 표시
  if (diff < 0) {
    return '방금 전';
  }
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}일 전`;
  } else if (hours > 0) {
    return `${hours}시간 전`;
  } else if (minutes > 0) {
    return `${minutes}분 전`;
  } else {
    return '방금 전';
  }
}

export function TrendCard({ trend, onViewDetail, onGenerateIdea, onDelete, currentUserId }: TrendCardProps) {
  const platformInfo = getPlatformInfo(trend.platform);
  const viralScore = trend.viral_score || 0;
  const samyangScore = trend.samyang_relevance || 0;

  // 삭제 버튼 표시: onDelete가 있으면 표시 (서버에서 권한 체크)
  const canDelete = !!onDelete;

  return (
    <Card
      className="group relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
      onClick={() => onViewDetail?.(trend)}
    >
      {/* 삭제 버튼 - 우측 상단 */}
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(trend);
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

      {/* 헤더 */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${platformInfo.color}`}
            >
              <span>{platformInfo.icon}</span>
              <span>{platformInfo.name}</span>
            </span>
            {trend.country && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                {trend.country}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(trend.created_at)}
          </span>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-4">
        {/* 키워드 */}
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{trend.keyword}</h3>

        {/* 포맷 유형 */}
        {trend.format_type && (
          <p className="mb-4 text-sm text-gray-600">
            <span className="font-medium">포맷:</span> {trend.format_type}
          </p>
        )}

        {/* 점수 섹션 */}
        <div className="space-y-3">
          {/* 바이럴 점수 */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">바이럴 점수</span>
              <span className="text-sm font-bold text-gray-900">{viralScore}/100</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all ${getScoreColor(viralScore)}`}
                style={{ width: `${viralScore}%` }}
              />
            </div>
          </div>

          {/* 삼양 연관성 */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">삼양 연관성</span>
              <span className="text-sm font-bold text-gray-900">{samyangScore}/100</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all ${getScoreColor(samyangScore)}`}
                style={{ width: `${samyangScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-4">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onGenerateIdea?.(trend);
            }}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            아이디어 생성
          </Button>
        </div>
      </div>
    </Card>
  );
}
