'use client';

import { Card } from '@/components/ui/card';
import { useCreators } from '@/hooks/useCreators';
import Link from 'next/link';
import { Users } from 'lucide-react';

interface RecommendedCreatorsWidgetProps {
  showAll?: boolean;
}

export function RecommendedCreatorsWidget({ showAll = true }: RecommendedCreatorsWidgetProps) {
  const { data, isLoading } = useCreators({
    limit: 3,
    sortBy: 'brand_fit_score',
    sortOrder: 'desc',
    showAll,
  });

  const creators = data?.creators || [];

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">추천 크리에이터</h3>
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
          <Users className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">추천 크리에이터</h3>
        </div>
        <Link
          href="/creators"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          전체 보기
        </Link>
      </div>

      {creators.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          크리에이터 데이터가 없습니다
        </p>
      ) : (
        <div className="space-y-3">
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="group flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                {creator.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {creator.username}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                    {creator.platform}
                  </span>
                  <span>적합도: {creator.brand_fit_score || 0}점</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
