import { Trend } from '@/types/trends';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Analysis data interface
interface TrendAnalysisData {
  brand_fit_reason?: string;
  target_audience?: string;
  estimated_reach?: string;
  key_success_factors?: string[];
  risks?: string[];
  recommended_products?: string[];
  collected_videos?: Array<{
    title: string;
    url: string;
    viewCount: number;
  }>;
}

interface TrendDetailModalProps {
  trend: Trend | null;
  open: boolean;
  onClose: () => void;
  onGenerateIdea?: (trend: Trend) => void;
}

/**
 * 플랫폼 정보 반환
 */
function getPlatformName(platform: string) {
  switch (platform) {
    case 'shorts':
      return 'YouTube Shorts';
    case 'tiktok':
      return 'TikTok';
    case 'reels':
      return 'Instagram Reels';
    default:
      return platform;
  }
}

/**
 * 점수에 따른 배지 색상 반환
 */
function getScoreBadgeColor(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  if (score >= 40) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

/**
 * 날짜 포맷팅
 */
function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function TrendDetailModal({
  trend,
  open,
  onClose,
  onGenerateIdea,
}: TrendDetailModalProps) {
  if (!trend) return null;

  const viralScore = trend.viral_score || 0;
  const samyangScore = trend.samyang_relevance || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{trend.keyword}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">플랫폼</h3>
              <p className="text-base font-semibold">
                {getPlatformName(trend.platform)}
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">국가</h3>
              <p className="text-base font-semibold">{trend.country}</p>
            </div>
            {trend.format_type && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">
                  포맷 유형
                </h3>
                <p className="text-base font-semibold">{trend.format_type}</p>
              </div>
            )}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">
                생성 시간
              </h3>
              <p className="text-base font-semibold">
                {formatDateTime(trend.created_at)}
              </p>
            </div>
          </div>

          {/* 점수 섹션 */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-4 text-lg font-semibold">분석 점수</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    바이럴 점수
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${getScoreBadgeColor(viralScore)}`}
                  >
                    {viralScore}/100
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${viralScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    삼양 연관성
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${getScoreBadgeColor(samyangScore)}`}
                  >
                    {samyangScore}/100
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${samyangScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 패턴 분석 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">패턴 분석</h3>

            {trend.hook_pattern && (
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900">
                  <span className="text-xl">🎣</span>
                  훅 패턴
                </h4>
                <p className="text-sm text-gray-700">{trend.hook_pattern}</p>
              </div>
            )}

            {trend.visual_pattern && (
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900">
                  <span className="text-xl">🎨</span>
                  시각적 패턴
                </h4>
                <p className="text-sm text-gray-700">{trend.visual_pattern}</p>
              </div>
            )}

            {trend.music_pattern && (
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900">
                  <span className="text-xl">🎵</span>
                  음악 패턴
                </h4>
                <p className="text-sm text-gray-700">{trend.music_pattern}</p>
              </div>
            )}

            {!trend.hook_pattern &&
              !trend.visual_pattern &&
              !trend.music_pattern && (
                <p className="text-center text-sm text-gray-500">
                  패턴 분석 데이터가 없습니다.
                </p>
              )}
          </div>

          {/* 추가 분석 정보 */}
          {trend.analysis_data && Object.keys(trend.analysis_data).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">추가 분석 정보</h3>

              {/* 브랜드 적합성 이유 */}
              {(trend.analysis_data as TrendAnalysisData).brand_fit_reason && (
                <div className="rounded-lg border bg-blue-50 p-4">
                  <h4 className="mb-2 font-medium text-blue-900">
                    💡 브랜드 적합성
                  </h4>
                  <p className="text-sm text-gray-700">
                    {(trend.analysis_data as TrendAnalysisData).brand_fit_reason}
                  </p>
                </div>
              )}

              {/* 타겟 오디언스 */}
              {(trend.analysis_data as TrendAnalysisData).target_audience && (
                <div className="rounded-lg border bg-purple-50 p-4">
                  <h4 className="mb-2 font-medium text-purple-900">
                    🎯 타겟 오디언스
                  </h4>
                  <p className="text-sm text-gray-700">
                    {(trend.analysis_data as TrendAnalysisData).target_audience}
                  </p>
                </div>
              )}

              {/* 예상 도달률 */}
              {(trend.analysis_data as TrendAnalysisData).estimated_reach && (
                <div className="rounded-lg border bg-green-50 p-4">
                  <h4 className="mb-2 font-medium text-green-900">
                    📈 예상 도달률
                  </h4>
                  <p className="text-sm text-gray-700">
                    {(trend.analysis_data as TrendAnalysisData).estimated_reach}
                  </p>
                </div>
              )}

              {/* 핵심 성공 요인 */}
              {(trend.analysis_data as TrendAnalysisData).key_success_factors &&
                Array.isArray((trend.analysis_data as TrendAnalysisData).key_success_factors) && (
                  <div className="rounded-lg border p-4">
                    <h4 className="mb-2 font-medium text-gray-900">
                      ✨ 핵심 성공 요인
                    </h4>
                    <ul className="space-y-1">
                      {(trend.analysis_data as TrendAnalysisData).key_success_factors!.map(
                        (factor: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <span className="mt-1 text-green-500">•</span>
                            <span>{factor}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* 리스크 */}
              {(trend.analysis_data as TrendAnalysisData).risks &&
                Array.isArray((trend.analysis_data as TrendAnalysisData).risks) && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <h4 className="mb-2 font-medium text-orange-900">
                      ⚠️ 잠재적 리스크
                    </h4>
                    <ul className="space-y-1">
                      {(trend.analysis_data as TrendAnalysisData).risks!.map(
                        (risk: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <span className="mt-1 text-orange-500">•</span>
                            <span>{risk}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* 추천 제품 */}
              {(trend.analysis_data as TrendAnalysisData).recommended_products &&
                Array.isArray((trend.analysis_data as TrendAnalysisData).recommended_products) && (
                  <div className="rounded-lg border p-4">
                    <h4 className="mb-3 font-medium text-gray-900">
                      🍜 추천 제품
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(trend.analysis_data as TrendAnalysisData).recommended_products!.map(
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

              {/* 수집된 동영상 */}
              {(trend.analysis_data as TrendAnalysisData).collected_videos &&
                Array.isArray((trend.analysis_data as TrendAnalysisData).collected_videos) &&
                (trend.analysis_data as TrendAnalysisData).collected_videos!.length > 0 && (
                  <div className="rounded-lg border p-4">
                    <h4 className="mb-3 font-medium text-gray-900">
                      🎬 참고 영상 (상위 {(trend.analysis_data as TrendAnalysisData).collected_videos!.length}개)
                    </h4>
                    <div className="space-y-2">
                      {(trend.analysis_data as TrendAnalysisData).collected_videos!.map(
                        (
                          video: { title: string; url: string; viewCount: number },
                          index: number
                        ) => (
                          <a
                            key={index}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg border bg-white p-3 transition-shadow hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="flex-1 text-sm font-medium text-gray-900 line-clamp-2">
                                {video.title}
                              </p>
                              <span className="shrink-0 text-xs text-gray-500">
                                {video.viewCount
                                  ? `${(video.viewCount / 1000000).toFixed(1)}M`
                                  : 'N/A'}
                              </span>
                            </div>
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end border-t pt-4">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (onGenerateIdea) {
                  onGenerateIdea(trend);
                }
                onClose();
              }}
            >
              <svg
                className="mr-2 h-4 w-4"
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
              아이디어 생성
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
