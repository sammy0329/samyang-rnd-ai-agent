'use client';

import { Card } from '@/components/ui/card';
import { useContentIdeas } from '@/hooks/useContentIdeas';
import Link from 'next/link';
import { Lightbulb } from 'lucide-react';

export function RecentIdeasWidget() {
  const { data, isLoading } = useContentIdeas({
    limit: 3,
    showAll: true, // 대시보드에서는 전체 데이터 표시
  });

  const ideas = data?.data?.ideas || [];

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">최근 아이디어</h3>
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
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">최근 아이디어</h3>
        </div>
        <Link
          href="/content"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          전체 보기
        </Link>
      </div>

      {ideas.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          생성된 아이디어가 없습니다
        </p>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <Link
              key={idea.id}
              href="/content"
              className="group flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {idea.title}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700">
                    {idea.brand_category}
                  </span>
                  <span>{idea.tone}</span>
                  <span>{idea.target_country}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
