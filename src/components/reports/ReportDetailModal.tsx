'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Report } from '@/hooks/useReports';
import { TrendingUp, Users, Lightbulb, BarChart3, Globe, Award } from 'lucide-react';

interface ReportDetailModalProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  daily_trend: '데일리 트렌드 리포트',
  creator_match: '크리에이터 매칭 리포트',
  content_idea: '콘텐츠 아이디어 리포트',
};

// Stat Card Component
function StatCard({ icon: Icon, label, value, color = 'blue' }: {
  icon: any;
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`rounded-full p-2 ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export function ReportDetailModal({
  report,
  open,
  onOpenChange,
  onDownload,
}: ReportDetailModalProps) {
  if (!report) return null;

  const content = report.content as any;
  const typeLabel = REPORT_TYPE_LABELS[report.type] || report.type;

  // Daily Trend Report View
  const renderDailyTrendReport = () => {
    if (!content.summary) return null;

    return (
      <>
        {/* Summary Stats */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">주요 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={BarChart3}
              label="평균 바이럴 점수"
              value={content.summary.averageViralScore || 0}
              color="blue"
            />
            <StatCard
              icon={Award}
              label="평균 삼양 연관성"
              value={content.summary.averageSamyangRelevance || 0}
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              label="주요 플랫폼"
              value={content.summary.topPlatform?.toUpperCase() || '-'}
              color="purple"
            />
            <StatCard
              icon={Globe}
              label="주요 국가"
              value={content.summary.topCountry || '-'}
              color="orange"
            />
          </div>
        </div>

        {/* Top Trends Table */}
        {content.topTrends && content.topTrends.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              Top {content.topTrends.length} 트렌드
            </h3>
            <div className="rounded-lg border bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">키워드</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">플랫폼</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">국가</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">바이럴 점수</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">삼양 연관성</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">포맷</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {content.topTrends.map((trend: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{trend.keyword}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                            {trend.platform?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{trend.country}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            {trend.viralScore}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                            {trend.samyangRelevance}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {trend.formatType || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Creator Match Report View
  const renderCreatorMatchReport = () => {
    if (!content.summary) return null;

    return (
      <>
        {/* Summary Stats */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">매칭 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={Award}
              label="평균 브랜드 적합도"
              value={content.summary.averageBrandFitScore || 0}
              color="blue"
            />
            <StatCard
              icon={Users}
              label="고적합도 (80+)"
              value={`${content.summary.highFitCount || 0}명`}
              color="green"
            />
            <StatCard
              icon={Users}
              label="중적합도 (60-79)"
              value={`${content.summary.mediumFitCount || 0}명`}
              color="orange"
            />
            <StatCard
              icon={TrendingUp}
              label="주요 플랫폼"
              value={content.summary.topPlatform?.toUpperCase() || '-'}
              color="purple"
            />
          </div>
        </div>

        {/* Top Creators Table */}
        {content.topCreators && content.topCreators.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              Top {content.topCreators.length} 크리에이터
            </h3>
            <div className="rounded-lg border bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">사용자명</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">플랫폼</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">브랜드 적합도</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">팔로워</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">참여율</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">카테고리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {content.topCreators.map((creator: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">@{creator.username}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                            {creator.platform?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                            creator.brandFitScore >= 80
                              ? 'bg-green-100 text-green-700'
                              : creator.brandFitScore >= 60
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {creator.brandFitScore}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {creator.followerCount?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {creator.engagementRate?.toFixed(1) || 0}%
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {creator.contentCategory || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Content Idea Report View
  const renderContentIdeaReport = () => {
    if (!content.summary) return null;

    return (
      <>
        {/* Summary Stats */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">브랜드별 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard
              icon={Lightbulb}
              label="불닭볶음면"
              value={`${content.summary.buldakCount || 0}개`}
              color="orange"
            />
            <StatCard
              icon={Lightbulb}
              label="삼양라면"
              value={`${content.summary.samyangRamenCount || 0}개`}
              color="blue"
            />
            <StatCard
              icon={Lightbulb}
              label="젤리"
              value={`${content.summary.jellyCount || 0}개`}
              color="purple"
            />
            <StatCard
              icon={BarChart3}
              label="주요 톤"
              value={content.summary.topTone || '-'}
              color="green"
            />
            <StatCard
              icon={Globe}
              label="주요 국가"
              value={content.summary.topCountry || '-'}
              color="blue"
            />
          </div>
        </div>

        {/* Top Ideas */}
        {content.topIdeas && content.topIdeas.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              Top {content.topIdeas.length} 아이디어
            </h3>
            <div className="space-y-3">
              {content.topIdeas.map((idea: any, index: number) => (
                <div key={index} className="rounded-lg border bg-white p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-2">{idea.title}</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                          {idea.brandCategory}
                        </span>
                        <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          {idea.tone}
                        </span>
                        <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                          {idea.targetCountry}
                        </span>
                        {idea.formatType && (
                          <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            {idea.formatType}
                          </span>
                        )}
                      </div>
                      {idea.hookText && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          &ldquo;{idea.hookText}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{typeLabel}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-3 font-semibold text-gray-900">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">생성 날짜:</span>
                <p className="text-gray-900">{content.date || '날짜 없음'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">총 항목:</span>
                <p className="text-gray-900">
                  {content.totalTrends || content.totalCreators || content.totalIdeas || 0}개
                </p>
              </div>
            </div>
          </div>

          {/* Type-specific content */}
          {report.type === 'daily_trend' && renderDailyTrendReport()}
          {report.type === 'creator_match' && renderCreatorMatchReport()}
          {report.type === 'content_idea' && renderContentIdeaReport()}

          {/* 추천사항 */}
          {content.recommendations && content.recommendations.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">추천사항</h3>
              <ul className="space-y-2 rounded-lg border bg-blue-50 p-4">
                {content.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-600">✓</span>
                    <span className="text-gray-900">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              닫기
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={onDownload}>
              JSON 다운로드
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
