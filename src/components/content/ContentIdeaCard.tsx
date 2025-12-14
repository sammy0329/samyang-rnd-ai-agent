'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Scene {
  duration: string;
  description: string;
  camera_angle?: string;
  action: string;
}

interface ExpectedPerformance {
  estimated_views: string;
  estimated_engagement: string;
  virality_potential: 'high' | 'medium' | 'low';
}

interface ContentIdea {
  id: string;
  title: string;
  brand_category: string;
  tone: string;
  format_type?: string;
  platform?: string;
  hook_text: string;
  scene_structure: Scene[] | Record<string, unknown>;
  editing_format: string;
  music_style: string;
  props_needed: string[];
  target_country: string;
  expected_performance: ExpectedPerformance | Record<string, unknown>;
  hashtags?: string[];
  production_tips?: string[];
  created_at: string;
  created_by: string | null;
}

interface ContentIdeaCardProps {
  idea: ContentIdea;
  onClick?: () => void;
  onDelete?: (idea: ContentIdea) => void;
  currentUserId?: string;
}

// 포맷 타입 한글 매핑
const FORMAT_TYPE_LABELS: Record<string, string> = {
  Challenge: '챌린지',
  Recipe: '레시피',
  ASMR: 'ASMR',
  Comedy: '코미디',
  Review: '리뷰',
  Tutorial: '튜토리얼',
};

// 플랫폼 아이콘 및 색상
const PLATFORM_CONFIG: Record<string, { icon: string; color: string }> = {
  tiktok: { icon: '🎵', color: 'bg-black text-white' },
  instagram: { icon: '📷', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
  youtube: { icon: '▶️', color: 'bg-red-600 text-white' },
};

// 바이럴 잠재력 배지
const VIRALITY_LABELS: Record<string, { text: string; color: string }> = {
  high: { text: '높음', color: 'bg-green-100 text-green-800' },
  medium: { text: '중간', color: 'bg-yellow-100 text-yellow-800' },
  low: { text: '낮음', color: 'bg-gray-100 text-gray-800' },
};

// 브랜드 카테고리 한글 매핑
const BRAND_LABELS: Record<string, string> = {
  buldak: '불닭볶음면',
  samyang_ramen: '삼양라면',
  jelly: '젤리',
};

// 톤앤매너 한글 매핑
const TONE_LABELS: Record<string, string> = {
  fun: '재미/유머',
  kawaii: '카와이',
  provocative: '도발적',
  cool: '쿨/세련됨',
};

// 국가 한글 매핑
const COUNTRY_LABELS: Record<string, string> = {
  KR: '한국',
  US: '미국',
  JP: '일본',
};

export function ContentIdeaCard({ idea, onClick, onDelete, currentUserId }: ContentIdeaCardProps) {
  const formatType = idea.format_type || 'Unknown';
  const platform = idea.platform || 'youtube';
  const platformConfig = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.youtube;

  // scene_structure를 배열로 변환
  const scenes: Scene[] = Array.isArray(idea.scene_structure) ? idea.scene_structure : [];

  // expected_performance 처리
  const performance = idea.expected_performance as ExpectedPerformance;
  const viralityPotential = performance?.virality_potential || 'medium';
  const viralityConfig = VIRALITY_LABELS[viralityPotential];

  // 삭제 버튼 표시: onDelete가 있으면 표시 (서버에서 권한 체크)
  const canDelete = !!onDelete;

  return (
    <Card
      className="group relative flex h-full min-h-[480px] cursor-pointer flex-col overflow-hidden p-6 transition-all hover:scale-[1.02] hover:shadow-lg"
      onClick={onClick}
    >
      {/* 삭제 버튼 - 우측 상단 */}
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(idea);
          }}
          className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 hover:shadow-md"
          title="삭제"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* 헤더 */}
      <div className="mb-4 pt-6">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1 pr-8">
            <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
              {idea.title}
            </h3>
          </div>
          {/* 플랫폼 배지 */}
          <span
            className={`ml-2 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${platformConfig.color}`}
          >
            <span>{platformConfig.icon}</span>
            <span className="uppercase">{platform}</span>
          </span>
        </div>

        {/* 메타 정보 */}
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            {FORMAT_TYPE_LABELS[formatType] || formatType}
          </span>
          <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
            {BRAND_LABELS[idea.brand_category] || idea.brand_category}
          </span>
          <span className="rounded-full bg-pink-100 px-2 py-1 text-xs font-medium text-pink-800">
            {TONE_LABELS[idea.tone] || idea.tone}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
            {COUNTRY_LABELS[idea.target_country] || idea.target_country}
          </span>
        </div>
      </div>

      {/* 후킹 텍스트 */}
      <div className="mb-4">
        <h4 className="mb-1 text-sm font-medium text-gray-700">5초 훅</h4>
        <p className="text-sm text-gray-900 italic">"{idea.hook_text}"</p>
      </div>

      {/* 장면 구성 */}
      {scenes.length > 0 && (
        <div className="mb-4 flex-shrink-0">
          <h4 className="mb-2 text-sm font-medium text-gray-700">장면 구성 ({scenes.length}컷)</h4>
          <div className="space-y-2">
            {scenes.slice(0, 2).map((scene, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="line-clamp-2 text-gray-900">
                    {scene.description}
                    {scene.duration && (
                      <span className="ml-1 text-gray-500">({scene.duration})</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {scenes.length > 2 && (
              <p className="text-xs text-gray-500">+{scenes.length - 2}개 더 보기</p>
            )}
          </div>
        </div>
      )}

      {/* 제작 정보 */}
      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <h4 className="mb-1 font-medium text-gray-700">편집 포맷</h4>
          <p className="text-gray-600">{idea.editing_format}</p>
        </div>
        <div>
          <h4 className="mb-1 font-medium text-gray-700">음악 스타일</h4>
          <p className="text-gray-600">{idea.music_style}</p>
        </div>
      </div>

      {/* Spacer to push footer to bottom */}
      <div className="flex-grow" />

      {/* 예상 성과 */}
      <div className="flex-shrink-0 border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-gray-700">바이럴 잠재력: </span>
            <span
              className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${viralityConfig.color}`}
            >
              {viralityConfig.text}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {performance?.estimated_views && (
              <span className="truncate">조회수: {performance.estimated_views}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
