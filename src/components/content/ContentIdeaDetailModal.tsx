'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  hook_visual?: string;
  scene_structure: Scene[] | Record<string, unknown>;
  editing_format: string;
  music_style: string;
  props_needed: string[];
  target_country: string;
  expected_performance: ExpectedPerformance | Record<string, unknown>;
  hashtags?: string[];
  production_tips?: string[];
  common_mistakes?: string[];
  created_at: string;
  created_by: string | null;
}

interface ContentIdeaDetailModalProps {
  idea: ContentIdea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

// 포맷 타입 한글 매핑
const FORMAT_TYPE_LABELS: Record<string, string> = {
  Challenge: '챌린지',
  Recipe: '레시피',
  ASMR: 'ASMR',
  Comedy: '코미디',
  Review: '리뷰',
  Tutorial: '튜토리얼',
};

// 플랫폼 한글 매핑
const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube Shorts',
};

// 바이럴 잠재력 배지
const VIRALITY_LABELS: Record<string, { text: string; color: string }> = {
  high: { text: '높음 🔥', color: 'bg-green-100 text-green-800' },
  medium: { text: '중간 ⚡', color: 'bg-yellow-100 text-yellow-800' },
  low: { text: '낮음 📊', color: 'bg-gray-100 text-gray-800' },
};

export function ContentIdeaDetailModal({
  idea,
  open,
  onOpenChange,
}: ContentIdeaDetailModalProps) {
  if (!idea) return null;

  const scenes: Scene[] = Array.isArray(idea.scene_structure)
    ? idea.scene_structure
    : [];
  const performance = idea.expected_performance as ExpectedPerformance;
  const viralityPotential = performance?.virality_potential || 'medium';
  const viralityConfig = VIRALITY_LABELS[viralityPotential];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{idea.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-3 font-semibold text-gray-900">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <span className="font-medium text-gray-700">포맷:</span>
                <p className="text-gray-900">
                  {FORMAT_TYPE_LABELS[idea.format_type || ''] || idea.format_type || '-'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">플랫폼:</span>
                <p className="text-gray-900">
                  {PLATFORM_LABELS[idea.platform || ''] || idea.platform || '-'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">브랜드:</span>
                <p className="text-gray-900">
                  {BRAND_LABELS[idea.brand_category] || idea.brand_category}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">톤앤매너:</span>
                <p className="text-gray-900">
                  {TONE_LABELS[idea.tone] || idea.tone}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">타깃 국가:</span>
                <p className="text-gray-900">
                  {COUNTRY_LABELS[idea.target_country] || idea.target_country}
                </p>
              </div>
            </div>
          </div>

          {/* 후킹 전략 */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">후킹 전략 (첫 5초)</h3>
            <div className="space-y-3 rounded-lg border bg-blue-50 p-4">
              <div>
                <span className="text-sm font-medium text-gray-700">훅 텍스트:</span>
                <p className="mt-1 text-lg font-medium text-gray-900 italic">
                  &ldquo;{idea.hook_text}&rdquo;
                </p>
              </div>
              {idea.hook_visual && (
                <div>
                  <span className="text-sm font-medium text-gray-700">훅 비주얼:</span>
                  <p className="mt-1 text-gray-900">{idea.hook_visual}</p>
                </div>
              )}
            </div>
          </div>

          {/* 장면 구성 */}
          {scenes.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">
                장면 구성 ({scenes.length}컷)
              </h3>
              <div className="space-y-3">
                {scenes.map((scene, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-white p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {scene.description}
                        </p>
                        {scene.duration && (
                          <p className="mt-1 text-sm text-gray-600">
                            길이: {scene.duration}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-11 space-y-1 text-sm">
                      {scene.camera_angle && (
                        <p className="text-gray-700">
                          <span className="font-medium">카메라:</span> {scene.camera_angle}
                        </p>
                      )}
                      <p className="text-gray-700">
                        <span className="font-medium">액션:</span> {scene.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 제작 가이드 */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">제작 가이드</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-white p-4">
                <h4 className="mb-2 font-medium text-gray-900">편집 포맷</h4>
                <p className="text-sm text-gray-700">{idea.editing_format}</p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <h4 className="mb-2 font-medium text-gray-900">음악 스타일</h4>
                <p className="text-sm text-gray-700">{idea.music_style}</p>
              </div>
            </div>
          </div>

          {/* 필요 소품 */}
          {idea.props_needed && idea.props_needed.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">필요 소품/재료</h3>
              <div className="flex flex-wrap gap-2">
                {idea.props_needed.map((prop, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
                  >
                    {prop}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 해시태그 */}
          {idea.hashtags && idea.hashtags.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">추천 해시태그</h3>
              <div className="flex flex-wrap gap-2">
                {idea.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 예상 성과 */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">예상 성과</h3>
            <div className="grid gap-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:grid-cols-3">
              {performance?.estimated_views && (
                <div>
                  <span className="text-sm font-medium text-gray-700">예상 조회수</span>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {performance.estimated_views}
                  </p>
                </div>
              )}
              {performance?.estimated_engagement && (
                <div>
                  <span className="text-sm font-medium text-gray-700">예상 참여율</span>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {performance.estimated_engagement}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-700">바이럴 잠재력</span>
                <p className="mt-1">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${viralityConfig.color}`}
                  >
                    {viralityConfig.text}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 제작 팁 */}
          {idea.production_tips && idea.production_tips.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">제작 팁 💡</h3>
              <ul className="space-y-2 rounded-lg border bg-green-50 p-4">
                {idea.production_tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-900">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 피해야 할 실수 */}
          {idea.common_mistakes && idea.common_mistakes.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">피해야 할 실수 ⚠️</h3>
              <ul className="space-y-2 rounded-lg border bg-red-50 p-4">
                {idea.common_mistakes.map((mistake, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-red-600">✗</span>
                    <span className="text-gray-900">{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end border-t pt-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              촬영 가이드 다운로드
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
