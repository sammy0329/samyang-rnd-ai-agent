'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ContentGenerationForm } from '@/components/content/ContentGenerationForm';
import { ContentIdeaCard } from '@/components/content/ContentIdeaCard';
import { ContentIdeaDetailModal } from '@/components/content/ContentIdeaDetailModal';
import { useContentIdeas, type ContentIdea } from '@/hooks/useContentIdeas';

export default function ContentPage() {
  const [generatedIdeas, setGeneratedIdeas] = useState<ContentIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // React Query로 기존 아이디어 목록 가져오기
  const { data: contentIdeasData, refetch } = useContentIdeas({
    limit: 50,
  });

  const handleGenerationSuccess = (ideas: ContentIdea[]) => {
    setGeneratedIdeas(ideas);
    // 새 아이디어 생성 후 목록 다시 가져오기
    refetch();
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setIsGenerating(isLoading);
  };

  const handleCardClick = (idea: ContentIdea) => {
    setSelectedIdea(idea);
    setIsModalOpen(true);
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
        </div>

        {/* 로딩 상태 */}
        {isGenerating && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-96 animate-pulse bg-gray-100" />
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!isGenerating && allIdeas.length === 0 && (
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

        {/* 아이디어 카드 그리드 */}
        {!isGenerating && allIdeas.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allIdeas.map((idea) => (
              <ContentIdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => handleCardClick(idea)}
              />
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
