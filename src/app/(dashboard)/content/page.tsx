'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ContentPage() {
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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
      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          콘텐츠 아이디어 생성
        </h2>
        <div className="space-y-6">
          {/* 브랜드 카테고리 선택 */}
          <div>
            <label
              htmlFor="brandCategory"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              브랜드 카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              id="brandCategory"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">선택하세요</option>
              <option value="buldak">불닭볶음면</option>
              <option value="samyang_ramen">삼양라면</option>
              <option value="jelly">젤리</option>
            </select>
          </div>

          {/* 톤앤매너 선택 */}
          <div>
            <label
              htmlFor="tone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              톤앤매너 <span className="text-red-500">*</span>
            </label>
            <select
              id="tone"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">선택하세요</option>
              <option value="fun">재미/유머</option>
              <option value="kawaii">카와이/귀여움</option>
              <option value="provocative">도발적/자극적</option>
              <option value="cool">쿨/세련됨</option>
            </select>
          </div>

          {/* 타깃 국가 선택 */}
          <div>
            <label
              htmlFor="targetCountry"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              타깃 국가 <span className="text-red-500">*</span>
            </label>
            <select
              id="targetCountry"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">선택하세요</option>
              <option value="KR">한국</option>
              <option value="US">미국</option>
              <option value="JP">일본</option>
            </select>
          </div>

          {/* 생성 버튼 */}
          <div className="flex justify-end">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isGenerating}
            >
              {isGenerating ? '생성 중...' : '아이디어 생성 (3개)'}
            </Button>
          </div>
        </div>
      </Card>

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
