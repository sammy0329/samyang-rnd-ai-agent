'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Creator } from '@/types/creators';

// Analysis data types
interface QuantitativeScores {
  follower_score?: number;
  view_score?: number;
  engagement_score?: number;
  [key: string]: number | undefined;
}

interface QualitativeScores {
  category_fit?: number;
  tone_fit?: number;
  audience_fit?: number;
  [key: string]: number | undefined;
}

interface AnalysisData {
  quantitative_scores?: QuantitativeScores;
  qualitative_scores?: QualitativeScores;
  strengths?: string[];
  weaknesses?: string[];
  audience_analysis?: string;
  content_style_analysis?: string;
  recommended_products?: string[];
}

interface CollaborationHistory {
  recommended_type?: string;
  content_suggestions?: string[];
  estimated_performance?: string;
  budget_recommendation?: string;
}

interface RiskFactors {
  level?: 'high' | 'medium' | 'low';
  factors?: string[];
  mitigation?: string[];
}

interface CreatorDetailModalProps {
  creator: Creator | null;
  open: boolean;
  onClose: () => void;
}

// 플랫폼별 정보
const getPlatformInfo = (platform: 'tiktok' | 'instagram' | 'youtube') => {
  switch (platform) {
    case 'youtube':
      return { icon: '📹', label: 'YouTube', color: 'text-red-600' };
    case 'tiktok':
      return { icon: '🎵', label: 'TikTok', color: 'text-black' };
    case 'instagram':
      return { icon: '📱', label: 'Instagram', color: 'text-pink-600' };
  }
};

// 숫자 포맷팅
const formatNumber = (num: number | null): string => {
  if (num === null) return 'N/A';
  return num.toLocaleString('ko-KR');
};

// 점수에 따른 색상
const getScoreColor = (score: number | null): string => {
  if (score === null) return 'bg-gray-200';
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const getScoreBadgeColor = (score: number | null): string => {
  if (score === null) return 'bg-gray-100 text-gray-700';
  if (score >= 80) return 'bg-green-100 text-green-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700';
  if (score >= 40) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
};

export function CreatorDetailModal({
  creator,
  open,
  onClose,
}: CreatorDetailModalProps) {
  if (!creator) return null;

  const platformInfo = getPlatformInfo(creator.platform);
  const brandFitScore = creator.brand_fit_score || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={platformInfo.color}>{platformInfo.icon}</span>
            {creator.username}
          </DialogTitle>
          <DialogDescription>
            {platformInfo.label} 크리에이터 상세 정보 및 브랜드 적합도 분석
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm text-gray-500">플랫폼</p>
              <p className="mt-1 font-medium">{platformInfo.label}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">프로필 URL</p>
              <a
                href={creator.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block truncate text-sm text-blue-600 hover:underline"
              >
                {creator.profile_url}
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-500">팔로워 수</p>
              <p className="mt-1 font-medium">{formatNumber(creator.follower_count)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">평균 조회수</p>
              <p className="mt-1 font-medium">{formatNumber(creator.avg_views)}</p>
            </div>
            {creator.engagement_rate !== null && (
              <div>
                <p className="text-sm text-gray-500">참여율</p>
                <p className="mt-1 font-medium">{creator.engagement_rate.toFixed(2)}%</p>
              </div>
            )}
            {creator.content_category && (
              <div>
                <p className="text-sm text-gray-500">콘텐츠 카테고리</p>
                <p className="mt-1 font-medium">{creator.content_category}</p>
              </div>
            )}
          </div>

          {/* 브랜드 적합도 점수 */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">브랜드 적합도 분석</h3>
            <div className="rounded-lg border p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">종합 점수</span>
                <span
                  className={`rounded-full px-3 py-1 text-lg font-bold ${getScoreBadgeColor(brandFitScore)}`}
                >
                  {brandFitScore}점
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full transition-all ${getScoreColor(brandFitScore)}`}
                  style={{ width: `${brandFitScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* 톤앤매너 */}
          {creator.tone_manner && (
            <div className="rounded-lg border bg-purple-50 p-4">
              <h4 className="mb-2 font-medium text-purple-900">🎨 톤앤매너</h4>
              <p className="text-sm text-gray-700">{creator.tone_manner}</p>
            </div>
          )}

          {/* 분석 데이터 */}
          {creator.analysis_data && Object.keys(creator.analysis_data).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">상세 분석 정보</h3>

              {/* 정량 평가 */}
              {(creator.analysis_data as AnalysisData).quantitative_scores && (
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 font-medium text-gray-900">📊 정량 평가</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      (creator.analysis_data as AnalysisData).quantitative_scores!
                    ).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {key === 'follower_score'
                            ? '팔로워 점수'
                            : key === 'view_score'
                              ? '조회수 점수'
                              : key === 'engagement_score'
                                ? '참여율 점수'
                                : key}
                        </span>
                        <span className="font-medium">{value as number}점</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 정성 평가 */}
              {(creator.analysis_data as AnalysisData).qualitative_scores && (
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 font-medium text-gray-900">✨ 정성 평가</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      (creator.analysis_data as AnalysisData).qualitative_scores!
                    ).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {key === 'category_fit'
                            ? '카테고리 적합성'
                            : key === 'tone_fit'
                              ? '톤앤매너 적합성'
                              : key === 'audience_fit'
                                ? '오디언스 적합성'
                                : key}
                        </span>
                        <span className="font-medium">{value as number}점</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 강점 */}
              {(creator.analysis_data as AnalysisData).strengths &&
                Array.isArray((creator.analysis_data as AnalysisData).strengths) && (
                  <div className="rounded-lg border bg-green-50 p-4">
                    <h4 className="mb-2 font-medium text-green-900">💪 강점</h4>
                    <ul className="space-y-1">
                      {(creator.analysis_data as AnalysisData).strengths!.map(
                        (strength: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <span className="mt-1 text-green-500">•</span>
                            <span>{strength}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* 약점 */}
              {(creator.analysis_data as AnalysisData).weaknesses &&
                Array.isArray((creator.analysis_data as AnalysisData).weaknesses) && (
                  <div className="rounded-lg border bg-orange-50 p-4">
                    <h4 className="mb-2 font-medium text-orange-900">⚠️ 약점</h4>
                    <ul className="space-y-1">
                      {(creator.analysis_data as AnalysisData).weaknesses!.map(
                        (weakness: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <span className="mt-1 text-orange-500">•</span>
                            <span>{weakness}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* 오디언스 분석 */}
              {(creator.analysis_data as AnalysisData).audience_analysis && (
                <div className="rounded-lg border bg-blue-50 p-4">
                  <h4 className="mb-2 font-medium text-blue-900">
                    🎯 오디언스 분석
                  </h4>
                  <p className="text-sm text-gray-700">
                    {(creator.analysis_data as AnalysisData).audience_analysis}
                  </p>
                </div>
              )}

              {/* 콘텐츠 스타일 분석 */}
              {(creator.analysis_data as AnalysisData).content_style_analysis && (
                <div className="rounded-lg border bg-purple-50 p-4">
                  <h4 className="mb-2 font-medium text-purple-900">
                    🎬 콘텐츠 스타일
                  </h4>
                  <p className="text-sm text-gray-700">
                    {(creator.analysis_data as AnalysisData).content_style_analysis}
                  </p>
                </div>
              )}

              {/* 추천 제품 */}
              {(creator.analysis_data as AnalysisData).recommended_products &&
                Array.isArray((creator.analysis_data as AnalysisData).recommended_products) && (
                  <div className="rounded-lg border p-4">
                    <h4 className="mb-3 font-medium text-gray-900">🍜 추천 제품</h4>
                    <div className="flex flex-wrap gap-2">
                      {(creator.analysis_data as AnalysisData).recommended_products!.map(
                        (product: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700"
                          >
                            {product === 'buldak'
                              ? '불닭볶음면'
                              : product === 'samyang_ramen'
                                ? '삼양라면'
                                : product === 'jelly'
                                  ? '젤리'
                                  : product}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* 협업 전략 */}
          {creator.collaboration_history &&
            Object.keys(creator.collaboration_history).length > 0 && (
              <div className="rounded-lg border bg-indigo-50 p-4">
                <h3 className="mb-3 text-lg font-semibold text-indigo-900">
                  🤝 협업 전략
                </h3>
                <div className="space-y-3">
                  {(creator.collaboration_history as CollaborationHistory).recommended_type && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">추천 협업 유형</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {(creator.collaboration_history as CollaborationHistory).recommended_type}
                      </p>
                    </div>
                  )}
                  {(creator.collaboration_history as CollaborationHistory).content_suggestions &&
                    Array.isArray(
                      (creator.collaboration_history as CollaborationHistory).content_suggestions
                    ) && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-gray-700">
                          콘텐츠 제안
                        </p>
                        <ul className="space-y-1">
                          {(creator.collaboration_history as CollaborationHistory).content_suggestions!.map(
                            (suggestion: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-gray-600"
                              >
                                <span className="mt-1 text-indigo-500">•</span>
                                <span>{suggestion}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  {(creator.collaboration_history as CollaborationHistory).estimated_performance && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">예상 성과</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {(creator.collaboration_history as CollaborationHistory).estimated_performance}
                      </p>
                    </div>
                  )}
                  {(creator.collaboration_history as CollaborationHistory).budget_recommendation && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">예산 권장사항</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {(creator.collaboration_history as CollaborationHistory).budget_recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* 리스크 평가 */}
          {creator.risk_factors && Object.keys(creator.risk_factors).length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-3 text-lg font-semibold text-red-900">⚠️ 리스크 평가</h3>
              <div className="space-y-3">
                {(creator.risk_factors as RiskFactors).level && (
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                        (creator.risk_factors as RiskFactors).level === 'high'
                          ? 'bg-red-200 text-red-800'
                          : (creator.risk_factors as RiskFactors).level === 'medium'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-green-200 text-green-800'
                      }`}
                    >
                      {(creator.risk_factors as RiskFactors).level === 'high'
                        ? '높음'
                        : (creator.risk_factors as RiskFactors).level === 'medium'
                          ? '중간'
                          : '낮음'}
                    </span>
                  </div>
                )}
                {(creator.risk_factors as RiskFactors).factors &&
                  Array.isArray((creator.risk_factors as RiskFactors).factors) && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">
                        리스크 요인
                      </p>
                      <ul className="space-y-1">
                        {(creator.risk_factors as RiskFactors).factors!.map(
                          (factor: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <span className="mt-1 text-red-500">•</span>
                              <span>{factor}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                {(creator.risk_factors as RiskFactors).mitigation &&
                  Array.isArray((creator.risk_factors as RiskFactors).mitigation) && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">완화 방안</p>
                      <ul className="space-y-1">
                        {(creator.risk_factors as RiskFactors).mitigation!.map(
                          (mitigation: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <span className="mt-1 text-green-500">•</span>
                              <span>{mitigation}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* 메타 정보 */}
          {creator.last_analyzed_at && (
            <div className="text-sm text-gray-500">
              마지막 분석:{' '}
              {new Date(creator.last_analyzed_at).toLocaleString('ko-KR')}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="border-t pt-4">
          <a
            href={creator.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              프로필 방문
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
