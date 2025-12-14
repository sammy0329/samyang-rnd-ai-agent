'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ContentGenerationForm } from '@/components/content/ContentGenerationForm';

interface ContentIdea {
  id: string;
  title: string;
  brand_category: string;
  tone: string;
  hook_text: string;
  scene_structure: Record<string, unknown>;
  editing_format: string;
  music_style: string;
  props_needed: string[];
  target_country: string;
  expected_performance: Record<string, unknown>;
  created_at: string;
}

export default function ContentPage() {
  const [generatedIdeas, setGeneratedIdeas] = useState<ContentIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerationSuccess = (ideas: ContentIdea[]) => {
    setGeneratedIdeas(ideas);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setIsGenerating(isLoading);
  };

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
            {generatedIdeas.length > 0 && (
              <span className="ml-2 text-gray-500">
                ({generatedIdeas.length}개)
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
        {!isGenerating && generatedIdeas.length === 0 && (
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

        {/* 아이디어 카드 그리드 (추후 구현) */}
        {!isGenerating && generatedIdeas.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {generatedIdeas.map((idea, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold">{idea.title}</h3>
                <p className="mt-2 text-sm text-gray-600">
                  아이디어 카드 컴포넌트가 여기에 표시됩니다
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
