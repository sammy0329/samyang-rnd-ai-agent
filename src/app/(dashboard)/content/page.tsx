'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { ContentIdeaCard } from '@/components/content/ContentIdeaCard';
import { ContentIdeaLoadingCard } from '@/components/content/ContentIdeaLoadingCard';
import { ContentIdeaErrorCard } from '@/components/content/ContentIdeaErrorCard';
import { useContentIdeas, type ContentIdea } from '@/hooks/useContentIdeas';
import { useAuthStore } from '@/store/useAuthStore';

// Dynamic imports for heavy components
const ContentGenerationForm = dynamic(
  () => import('@/components/content/ContentGenerationForm').then((mod) => ({ default: mod.ContentGenerationForm })),
  { ssr: false }
);

const ContentIdeaDetailModal = dynamic(
  () => import('@/components/content/ContentIdeaDetailModal').then((mod) => ({ default: mod.ContentIdeaDetailModal })),
  { ssr: false }
);

export default function ContentPage() {
  const { user } = useAuthStore();
  const currentUserId = user?.id;
  const queryClient = useQueryClient();

  const [generatedIdeas, setGeneratedIdeas] = useState<ContentIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showIdeas, setShowIdeas] = useState<boolean[]>([false, false, false]);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false); // 전체 데이터 보기 (기본값: 내 작업만)

  // React Query로 기존 아이디어 목록 가져오기
  const { data: contentIdeasData, refetch } = useContentIdeas({
    limit: 50,
    showAll,
  });

  const handleGenerationSuccess = (ideas: ContentIdea[]) => {
    setGeneratedIdeas(ideas);
    setGenerationError(null);

    // 순차적으로 아이디어 카드 표시 (stagger 효과)
    ideas.forEach((_, index) => {
      setTimeout(() => {
        setShowIdeas(prev => {
          const newShow = [...prev];
          newShow[index] = true;
          return newShow;
        });
      }, index * 200); // 200ms 간격으로 순차 표시
    });

    // 새 아이디어 생성 후 목록 다시 가져오기
    refetch();
  };

  const handleGenerationError = (error: string) => {
    setGenerationError(error);
    setGeneratedIdeas([]);
    setShowIdeas([false, false, false]);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setIsGenerating(isLoading);
    if (isLoading) {
      // 로딩 시작할 때 기존 표시 상태 초기화
      setShowIdeas([false, false, false]);
      setGenerationError(null);
    }
  };

  const handleCardClick = (idea: ContentIdea) => {
    setSelectedIdea(idea);
    setIsModalOpen(true);
  };

  const handleDelete = async (idea: ContentIdea) => {
    if (!confirm('정말 이 콘텐츠 아이디어를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/content?id=${idea.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '콘텐츠 아이디어 삭제에 실패했습니다.');
      }

      // 성공 시 모든 contentIdeas 쿼리 무효화 (전체/내 작업 모두)
      queryClient.invalidateQueries({ queryKey: ['contentIdeas'] });
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : '콘텐츠 아이디어 삭제에 실패했습니다.');
    }
  };

  // 생성된 아이디어와 기존 아이디어 합치기 (생성된 것이 우선)
  const allIdeas = [
    ...generatedIdeas,
    ...(contentIdeasData?.data?.ideas || []).filter(
      (idea) => !generatedIdeas.some((gen) => gen.id === idea.id)
    ),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">콘텐츠 아이디어 생성</h1>
        <p className="mt-2 text-gray-600">
          AI가 트렌드와 브랜드를 분석하여 최적의 숏폼 콘텐츠 아이디어를
          제안합니다
        </p>
      </div>

      {/* 생성 폼 섹션 */}
      <ContentGenerationForm
        onSuccess={handleGenerationSuccess}
        onError={handleGenerationError}
        onLoadingChange={handleLoadingChange}
      />

      {/* 결과 표시 섹션 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            생성된 아이디어
            {allIdeas.length > 0 && (
              <span className="ml-2 text-gray-500">
                ({allIdeas.length}개)
              </span>
            )}
          </h2>
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

        {/* 빈 상태 - 아무 것도 없을 때만 */}
        {!isGenerating && !generationError && allIdeas.length === 0 && (
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
                아이디어를 생성해보세요
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                브랜드, 톤앤매너, 타깃 국가를 선택하고 AI 아이디어 생성을
                시작하세요. 3개의 다양한 콘텐츠 아이디어가 생성됩니다.
              </p>
            </div>
          </Card>
        )}

        {/* 아이디어 카드 그리드 - 로딩/에러/완료 모두 표시 */}
        {(isGenerating || generationError || allIdeas.length > 0) && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 로딩 중이면 3개의 로딩 카드 또는 에러 카드 표시 */}
            {isGenerating && (
              <>
                {[...Array(3)].map((_, i) => (
                  <ContentIdeaLoadingCard key={`loading-${i}`} index={i} />
                ))}
              </>
            )}

            {/* 에러 상태 - 로딩 중이 아닐 때만 */}
            {!isGenerating && generationError && (
              <>
                {[...Array(3)].map((_, i) => (
                  <ContentIdeaErrorCard
                    key={`error-${i}`}
                    errorMessage={generationError}
                    onRetry={() => window.location.reload()}
                  />
                ))}
              </>
            )}

            {/* 기존 아이디어 카드들 - 로딩 중이 아니고 에러가 없을 때 */}
            {!isGenerating && !generationError && allIdeas.map((idea, index) => {
              // 최근 생성된 3개는 순차적 애니메이션 적용
              const isNewlyGenerated = index < 3 && generatedIdeas.length > 0;
              const shouldShow = !isNewlyGenerated || showIdeas[index];

              return (
                <div
                  key={idea.id}
                  className={`transition-all duration-500 ${
                    shouldShow
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                  }`}
                >
                  <ContentIdeaCard
                    idea={idea}
                    onClick={() => handleCardClick(idea)}
                    onDelete={handleDelete}
                    currentUserId={currentUserId}
                  />
                </div>
              );
            })}

            {/* 로딩 중이면서 기존 아이디어가 있는 경우 함께 표시 */}
            {isGenerating && allIdeas.length > 0 && allIdeas.map((idea) => (
              <div key={idea.id} className="opacity-60">
                <ContentIdeaCard
                  idea={idea}
                  onClick={() => handleCardClick(idea)}
                  onDelete={handleDelete}
                  currentUserId={currentUserId}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      <ContentIdeaDetailModal
        idea={selectedIdea}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
