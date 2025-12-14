import { Card } from '@/components/ui/card';

/**
 * 트렌드 카드 로딩 스켈레톤
 */
export function TrendCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* 헤더 */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-32 animate-pulse rounded-full bg-gray-200" />
            <div className="h-6 w-12 animate-pulse rounded-full bg-gray-200" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      {/* 본문 */}
      <div className="p-4">
        {/* 키워드 */}
        <div className="mb-2 h-7 w-3/4 animate-pulse rounded bg-gray-200" />

        {/* 포맷 */}
        <div className="mb-4 h-5 w-1/2 animate-pulse rounded bg-gray-200" />

        {/* 점수 섹션 */}
        <div className="space-y-3">
          {/* 바이럴 점수 */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-gray-200" />
          </div>

          {/* 삼양 연관성 */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-gray-200" />
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-4 flex gap-2">
          <div className="h-10 flex-1 animate-pulse rounded-md bg-gray-200" />
          <div className="h-10 flex-1 animate-pulse rounded-md bg-gray-200" />
        </div>
      </div>
    </Card>
  );
}

/**
 * 여러 개의 스켈레톤 카드를 그리드로 표시
 */
export function TrendCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <TrendCardSkeleton key={index} />
      ))}
    </div>
  );
}
