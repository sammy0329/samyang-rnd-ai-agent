'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TrendCard } from '@/components/trends/TrendCard';
import { TrendCardSkeletonGrid } from '@/components/trends/TrendCardSkeleton';
import { useTrends } from '@/hooks/useTrends';
import { Trend } from '@/types/trends';

// Dynamic imports for heavy components
const TrendAnalysisForm = dynamic(
  () => import('@/components/trends/TrendAnalysisForm').then((mod) => ({ default: mod.TrendAnalysisForm })),
  { ssr: false }
);

const TrendDetailModal = dynamic(
  () => import('@/components/trends/TrendDetailModal').then((mod) => ({ default: mod.TrendDetailModal })),
  { ssr: false }
);

export default function TrendsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 필터 상태 관리
  const [filters, setFilters] = useState({
    keyword: '',
    platform: '',
    country: '',
    minViralScore: false,
  });
  const [sortBy, setSortBy] = useState<'created_at' | 'viral_score' | 'samyang_relevance'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAll, setShowAll] = useState(false); // 전체 데이터 보기 (기본값: 내 작업만)

  // 플랫폼 값 매핑 (UI -> API)
  const mapPlatformToAPI = (platform: string): string | undefined => {
    if (!platform) return undefined;
    const mapping: Record<string, string> = {
      youtube: 'shorts',
      tiktok: 'tiktok',
      instagram: 'reels',
    };
    return mapping[platform];
  };

  // 정렬 값 매핑 (UI -> API)
  const mapSortToAPI = (sort: string): 'created_at' | 'viral_score' | 'samyang_relevance' => {
    const mapping: Record<string, 'created_at' | 'viral_score' | 'samyang_relevance'> = {
      latest: 'created_at',
      viral: 'viral_score',
      relevance: 'samyang_relevance',
    };
    return mapping[sort] || 'created_at';
  };

  // React Query로 트렌드 목록 가져오기
  const { data, isLoading, error, refetch } = useTrends({
    keyword: filters.keyword || undefined,
    platform: mapPlatformToAPI(filters.platform),
    country: (filters.country as 'KR' | 'US' | 'JP' | undefined) || undefined,
    minViralScore: filters.minViralScore ? 80 : undefined,
    sortBy,
    sortOrder,
    limit: 50,
    showAll,
  });

  const trends = data?.trends || [];
  const totalCount = data?.total || 0;

  const handleAnalysisSuccess = (data: any) => {
    console.log('Analysis success:', data);
    setAnalysisResult(data);
    setIsDialogOpen(false);
    // 트렌드 목록 새로고침
    refetch();
  };

  const handleAnalysisError = (error: any) => {
    console.error('Analysis error:', error);
  };

  const handleViewDetail = (trend: Trend) => {
    setSelectedTrend(trend);
    setIsDetailModalOpen(true);
  };

  const handleGenerateIdea = (trend: Trend) => {
    console.log('Generate idea:', trend);
    // TODO: 아이디어 생성 다이얼로그 열기
  };

  const handleFilterChange = (field: string, value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    // 필터가 변경되면 useTrends가 자동으로 재조회됨 (queryKey에 filters 포함)
    refetch();
  };

  const handleSortChange = (value: string) => {
    if (value.includes('-')) {
      const [sort, order] = value.split('-');
      setSortBy(mapSortToAPI(sort));
      setSortOrder((order as 'asc' | 'desc') || 'desc');
    } else {
      // 단일 값인 경우 (하위 호환성)
      setSortBy(mapSortToAPI(value));
      setSortOrder('desc');
    }
  };

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
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsDialogOpen(true)}
        >
          새 분석 시작
        </Button>
      </div>

      {/* 분석 성공 메시지 */}
      {analysisResult && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">분석 완료!</h3>
              <p className="mt-1 text-sm text-green-700">
                트렌드 분석이 성공적으로 완료되었습니다.
              </p>
            </div>
          </div>
        </div>
      )}

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
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
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
              value={filters.platform}
              onChange={(e) => handleFilterChange('platform', e.target.value)}
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
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
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
                checked={filters.minViralScore}
                onChange={(e) => handleFilterChange('minViralScore', e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">
                고품질만 보기 (바이럴 80+)
              </span>
            </label>
          </div>
          <Button variant="outline" onClick={handleSearch}>
            검색
          </Button>
        </div>
      </Card>

      {/* 결과 섹션 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            분석 결과 <span className="text-gray-500">({totalCount}개)</span>
          </h2>
          <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-gray-600">
                정렬:
              </label>
              <select
                id="sort"
                className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={`${sortBy === 'created_at' ? 'latest' : sortBy === 'viral_score' ? 'viral' : 'relevance'}-${sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="latest-desc">최신순</option>
                <option value="viral-desc">바이럴 점수순 (높은순)</option>
                <option value="viral-asc">바이럴 점수순 (낮은순)</option>
                <option value="relevance-desc">삼양 연관성순 (높은순)</option>
                <option value="relevance-asc">삼양 연관성순 (낮은순)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && <TrendCardSkeletonGrid count={6} />}

        {/* 에러 상태 */}
        {error && (
          <Card className="p-12 text-center">
            <div className="mx-auto max-w-md">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                데이터를 불러올 수 없습니다
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                트렌드 목록을 가져오는 중 오류가 발생했습니다.
              </p>
              <div className="mt-6">
                <Button onClick={() => refetch()} variant="outline">
                  다시 시도
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 데이터 표시 */}
        {!isLoading && !error && trends.length === 0 && (
          /* 빈 상태 */
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
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsDialogOpen(true)}
                >
                  첫 번째 분석 시작하기
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 트렌드 카드 그리드 */}
        {!isLoading && !error && trends.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trends.map((trend) => (
              <TrendCard
                key={trend.id}
                trend={trend}
                onViewDetail={handleViewDetail}
                onGenerateIdea={handleGenerateIdea}
              />
            ))}
          </div>
        )}
      </div>

      {/* 트렌드 분석 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>새 트렌드 분석</DialogTitle>
            <DialogDescription>
              분석하고자 하는 키워드와 플랫폼을 선택하세요. AI가 실시간 트렌드를
              분석하여 인사이트를 제공합니다.
            </DialogDescription>
          </DialogHeader>
          <TrendAnalysisForm
            onSuccess={handleAnalysisSuccess}
            onError={handleAnalysisError}
          />
        </DialogContent>
      </Dialog>

      {/* 트렌드 상세 모달 */}
      <TrendDetailModal
        trend={selectedTrend}
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onGenerateIdea={handleGenerateIdea}
      />
    </div>
  );
}
