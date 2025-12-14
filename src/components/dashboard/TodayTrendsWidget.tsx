'use client';

import { Card } from '@/components/ui/card';
import { useTrends } from '@/hooks/useTrends';
import Link from 'next/link';
import { TrendingUp, ExternalLink } from 'lucide-react';

export function TodayTrendsWidget() {
  const { data, isLoading } = useTrends({
    limit: 5,
    sortBy: 'viral_score',
    sortOrder: 'desc',
    showAll: true, // 대시보드에서는 전체 데이터 표시
  });

  const trends = data?.trends || [];
  const todayTrends = trends.slice(0, 3);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">오늘의 트렌드</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">오늘의 트렌드</h3>
        </div>
        <Link
          href="/trends"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          전체 보기
        </Link>
      </div>

      {todayTrends.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          트렌드 데이터가 없습니다
        </p>
      ) : (
        <div className="space-y-3">
          {todayTrends.map((trend) => (
            <div
              key={trend.id}
              className="group flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {trend.keyword}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                    {trend.platform}
                  </span>
                  <span>바이럴 점수: {trend.viral_score || 0}</span>
                  {trend.format_type && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                      {trend.format_type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
