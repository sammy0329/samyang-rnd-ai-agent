'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { TrendingUp, Lightbulb, Users, FileText } from 'lucide-react';
import Link from 'next/link';

// Dynamic imports for dashboard widgets
const TodayTrendsWidget = dynamic(
  () => import('@/components/dashboard/TodayTrendsWidget').then((mod) => ({ default: mod.TodayTrendsWidget })),
  { ssr: false, loading: () => <Card className="h-64 animate-pulse bg-gray-100" /> }
);

const RecentIdeasWidget = dynamic(
  () => import('@/components/dashboard/RecentIdeasWidget').then((mod) => ({ default: mod.RecentIdeasWidget })),
  { ssr: false, loading: () => <Card className="h-64 animate-pulse bg-gray-100" /> }
);

const RecommendedCreatorsWidget = dynamic(
  () => import('@/components/dashboard/RecommendedCreatorsWidget').then((mod) => ({ default: mod.RecommendedCreatorsWidget })),
  { ssr: false, loading: () => <Card className="h-64 animate-pulse bg-gray-100" /> }
);

const RecentReportsWidget = dynamic(
  () => import('@/components/dashboard/RecentReportsWidget').then((mod) => ({ default: mod.RecentReportsWidget })),
  { ssr: false, loading: () => <Card className="h-64 animate-pulse bg-gray-100" /> }
);

const ApiUsageWidget = dynamic(
  () => import('@/components/dashboard/ApiUsageWidget').then((mod) => ({ default: mod.ApiUsageWidget })),
  { ssr: false, loading: () => <Card className="h-64 animate-pulse bg-gray-100" /> }
);

export default function DashboardPage() {
  const [showAll, setShowAll] = useState(true); // 대시보드는 기본적으로 전체 데이터 표시

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-2 text-gray-600">
            Samyang AI Agent의 주요 지표와 최근 활동을 확인하세요
          </p>
        </div>
        {/* 내 작업 / 전체 토글 */}
        <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white p-1">
          <button
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              !showAll
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setShowAll(false)}
          >
            내 작업
          </button>
          <button
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              showAll
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setShowAll(true)}
          >
            전체
          </button>
        </div>
      </div>

      {/* 퀵 액션 카드 - 반응형 그리드 */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/trends">
          <Card className="group cursor-pointer p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-600">트렌드 분석</h3>
                <p className="truncate text-lg font-semibold text-gray-900">
                  트렌드 수집
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/creators">
          <Card className="group cursor-pointer p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-600">크리에이터</h3>
                <p className="truncate text-lg font-semibold text-gray-900">
                  매칭 관리
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/content">
          <Card className="group cursor-pointer p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 transition-colors group-hover:bg-yellow-600 group-hover:text-white">
                <Lightbulb className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-600">콘텐츠</h3>
                <p className="truncate text-lg font-semibold text-gray-900">
                  아이디어 생성
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/reports">
          <Card className="group cursor-pointer p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-600">리포트</h3>
                <p className="truncate text-lg font-semibold text-gray-900">
                  리포트 생성
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* 위젯 그리드 - 반응형 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 왼쪽 컬럼 */}
        <div className="space-y-6">
          <TodayTrendsWidget showAll={showAll} />
          <RecommendedCreatorsWidget showAll={showAll} />
        </div>

        {/* 오른쪽 컬럼 */}
        <div className="space-y-6">
          <RecentIdeasWidget showAll={showAll} />
          <RecentReportsWidget showAll={showAll} />
        </div>
      </div>

      {/* API 사용량 위젯 - 전체 너비 */}
      <div className="mt-6">
        <ApiUsageWidget />
      </div>
    </div>
  );
}
