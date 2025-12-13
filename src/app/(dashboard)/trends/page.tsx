import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: '트렌드 분석 | Samyang AI Agent',
  description: '숏폼 플랫폼 트렌드 분석 및 AI 기반 인사이트 제공',
};

export default function TrendsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 섹션 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">트렌드 분석</h1>
          <p className="mt-2 text-gray-600">
            TikTok, Instagram Reels, YouTube Shorts 트렌드를 AI가 분석합니다
          </p>
        </div>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          새 분석 시작
        </Button>
      </div>

      {/* 필터링 섹션 */}
      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">필터 및 검색</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* 키워드 입력 */}
          <div>
            <label
              htmlFor="keyword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              키워드
            </label>
            <Input
              id="keyword"
              type="text"
              placeholder="예: 불닭볶음면"
              className="w-full"
            />
          </div>

          {/* 플랫폼 선택 */}
          <div>
            <label
              htmlFor="platform"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              플랫폼
            </label>
            <select
              id="platform"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">전체</option>
              <option value="youtube">YouTube Shorts</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram Reels</option>
            </select>
          </div>

          {/* 국가 선택 */}
          <div>
            <label
              htmlFor="country"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              국가
            </label>
            <select
              id="country"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">전체</option>
              <option value="KR">한국</option>
              <option value="US">미국</option>
              <option value="JP">일본</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                고품질만 보기 (바이럴 80+)
              </span>
            </label>
          </div>
          <Button variant="outline">검색</Button>
        </div>
      </Card>

      {/* 결과 섹션 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            분석 결과 <span className="text-gray-500">(0개)</span>
          </h2>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-gray-600">
              정렬:
            </label>
            <select
              id="sort"
              className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="latest">최신순</option>
              <option value="viral">바이럴 점수순</option>
              <option value="relevance">삼양 연관성순</option>
            </select>
          </div>
        </div>

        {/* 빈 상태 */}
        <Card className="p-12 text-center">
          <div className="mx-auto max-w-md">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              트렌드 분석을 시작하세요
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              상단의 "새 분석 시작" 버튼을 클릭하거나 필터를 사용하여 기존
              분석 결과를 검색하세요.
            </p>
            <div className="mt-6">
              <Button className="bg-blue-600 hover:bg-blue-700">
                첫 번째 분석 시작하기
              </Button>
            </div>
          </div>
        </Card>

        {/* TODO: 트렌드 카드 그리드 (데이터가 있을 때 표시) */}
        {/*
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          트렌드 카드 컴포넌트들
        </div>
        */}
      </div>
    </div>
  );
}
