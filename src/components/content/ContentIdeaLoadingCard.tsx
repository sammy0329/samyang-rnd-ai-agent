'use client';

import { Card } from '@/components/ui/card';

interface ContentIdeaLoadingCardProps {
  index?: number;
}

export function ContentIdeaLoadingCard({ index = 0 }: ContentIdeaLoadingCardProps) {
  // 각 카드마다 약간의 지연을 주어 순차적으로 애니메이션되는 효과
  const animationDelay = `${index * 100}ms`;

  return (
    <Card
      className="relative overflow-hidden p-6"
      style={{ animationDelay }}
    >
      {/* 진행 표시 애니메이션 */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="space-y-4">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* 제목 */}
            <div className="h-6 w-3/4 animate-pulse rounded-md bg-gray-200" />
          </div>
          {/* 플랫폼 배지 */}
          <div className="ml-2 h-8 w-20 animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* 메타 정보 태그들 */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-14 animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* 훅 텍스트 */}
        <div className="space-y-2">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        </div>

        {/* 장면 구성 */}
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 제작 정보 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* 예상 성과 */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* 생성 중 표시 */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-50 to-transparent pb-4 pt-8">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <span>AI가 아이디어를 생성하고 있습니다...</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
