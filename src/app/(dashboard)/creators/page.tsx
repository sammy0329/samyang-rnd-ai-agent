'use client';

import { useState } from 'react';
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
import { useCreators } from '@/hooks/useCreators';
import { CreatorCard } from '@/components/creators/CreatorCard';
import { CreatorDetailModal } from '@/components/creators/CreatorDetailModal';
import type { Creator } from '@/types/creators';

export default function CreatorsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState({
    username: '',
    platform: '' as '' | 'youtube' | 'tiktok' | 'instagram',
    content_category: '',
    minBrandFitScore: undefined as number | undefined,
    sortBy: 'brand_fit_score' as const,
    sortOrder: 'desc' as const,
    limit: 50,
  });

  // React Query로 크리에이터 데이터 가져오기
  const { data, isLoading, error, refetch } = useCreators({
    ...filters,
    platform: filters.platform || undefined,
  });

  const creators = data?.creators || [];
  const totalCount = data?.total || 0;

  const handleViewDetail = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsDetailModalOpen(true);
  };

  const handleSearch = () => {
    refetch();
  };

  const handleHighQualityFilter = (checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      minBrandFitScore: checked ? 80 : undefined,
    }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 섹션 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">크리에이터 매칭</h1>
          <p className="mt-2 text-gray-600">
            AI가 분석한 브랜드 적합도를 기반으로 최적의 크리에이터를 찾아보세요
          </p>
        </div>
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsDialogOpen(true)}
        >
          새 크리에이터 매칭
        </Button>
      </div>

      {/* 매칭 성공 메시지 */}
      {matchResult && (
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
              <h3 className="text-sm font-medium text-green-800">매칭 완료!</h3>
              <p className="mt-1 text-sm text-green-700">
                크리에이터 분석이 성공적으로 완료되었습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 필터링 섹션 */}
      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">필터 및 검색</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {/* 크리에이터명 입력 */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              크리에이터명
            </label>
            <Input
              id="username"
              type="text"
              placeholder="예: @creator_name"
              className="w-full"
              value={filters.username}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, username: e.target.value }))
              }
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
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  platform: e.target.value as '' | 'youtube' | 'tiktok' | 'instagram',
                }))
              }
            >
              <option value="">전체</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>

          {/* 콘텐츠 카테고리 */}
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              콘텐츠 카테고리
            </label>
            <Input
              id="category"
              type="text"
              placeholder="예: 먹방, 챌린지"
              className="w-full"
              value={filters.content_category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, content_category: e.target.value }))
              }
            />
          </div>

          {/* 최소 브랜드 적합도 */}
          <div>
            <label
              htmlFor="minScore"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              최소 적합도 점수
            </label>
            <Input
              id="minScore"
              type="number"
              min="0"
              max="100"
              placeholder="0-100"
              className="w-full"
              value={filters.minBrandFitScore || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minBrandFitScore: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={filters.minBrandFitScore === 80}
                onChange={(e) => handleHighQualityFilter(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">
                고적합도만 보기 (80점 이상)
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
            매칭 결과 <span className="text-gray-500">({totalCount}개)</span>
          </h2>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-gray-600">
              정렬:
            </label>
            <select
              id="sort"
              className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as any,
                }))
              }
            >
              <option value="brand_fit_score">적합도 점수순</option>
              <option value="follower_count">팔로워순</option>
              <option value="engagement_rate">참여율순</option>
              <option value="created_at">최신순</option>
            </select>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-80 animate-pulse bg-gray-100" />
            ))}
          </div>
        )}

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
                데이터를 불러오는데 실패했습니다
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                잠시 후 다시 시도해주세요.
              </p>
              <div className="mt-6">
                <Button onClick={() => refetch()}>다시 시도</Button>
              </div>
            </div>
          </Card>
        )}

        {/* 빈 상태 */}
        {!isLoading && !error && creators.length === 0 && (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                크리에이터 매칭을 시작하세요
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                상단의 "새 크리에이터 매칭" 버튼을 클릭하거나 필터를 사용하여 기존
                매칭 결과를 검색하세요.
              </p>
              <div className="mt-6">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsDialogOpen(true)}
                >
                  첫 번째 매칭 시작하기
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 크리에이터 카드 그리드 */}
        {!isLoading && !error && creators.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        )}
      </div>

      {/* 크리에이터 매칭 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>새 크리에이터 매칭</DialogTitle>
            <DialogDescription>
              분석하고자 하는 크리에이터 정보를 입력하세요. AI가 브랜드 적합도를
              분석하여 인사이트를 제공합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              크리에이터 매칭 폼 컴포넌트가 여기에 표시됩니다.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* 크리에이터 상세 모달 */}
      <CreatorDetailModal
        creator={selectedCreator}
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}
