'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Report } from '@/hooks/useReports';
import { exportReport } from '@/hooks/useReports';
import { TrendingUp, Users, Lightbulb, BarChart3, Globe, Award, FileJson, FileText, LucideIcon } from 'lucide-react';

// Report content types
interface TrendItem {
  keyword: string;
  platform?: string;
  country?: string;
  formatType?: string;
  viralScore?: number;
  samyangRelevance?: number;
}

interface CreatorItem {
  username: string;
  platform?: string;
  contentCategory?: string;
  brandFitScore?: number;
  followerCount?: number;
  engagementRate?: number;
}

interface IdeaItem {
  title: string;
  brandCategory?: string;
  tone?: string;
  targetCountry?: string;
  formatType?: string;
  hookText?: string;
}

interface ReportSummary {
  averageViralScore?: number;
  averageSamyangRelevance?: number;
  topPlatform?: string;
  topCountry?: string;
  averageBrandFitScore?: number;
  highFitCount?: number;
  mediumFitCount?: number;
  buldakCount?: number;
  samyangRamenCount?: number;
  jellyCount?: number;
  topTone?: string;
}

interface ReportContent {
  date?: string;
  summary?: ReportSummary;
  topTrends?: TrendItem[];
  topCreators?: CreatorItem[];
  topIdeas?: IdeaItem[];
  totalTrends?: number;
  totalCreators?: number;
  totalIdeas?: number;
  recommendations?: string[];
}

interface ReportDetailModalProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: () => void; // Deprecated, kept for backwards compatibility
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  daily_trend: '데일리 트렌드 리포트',
  creator_match: '크리에이터 매칭 리포트',
  content_idea: '콘텐츠 아이디어 리포트',
};

// Stat Card Component
function StatCard({ icon: Icon, label, value, color = 'blue' }: {
  icon: LucideIcon;
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
}: ReportDetailModalProps) {
  const [isExporting, setIsExporting] = useState<'json' | 'pdf' | null>(null);

  if (!report) return null;

  const content = report.content as ReportContent;
  const typeLabel = REPORT_TYPE_LABELS[report.type] || report.type;

  const handleExport = async (format: 'json' | 'pdf') => {
    if (!report) return;
    setIsExporting(format);
    try {
      await exportReport(report.id, format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(null);
    }
  };

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

        {/* Top Trends Cards */}
        {content.topTrends && content.topTrends.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              Top {content.topTrends.length} 트렌드
            </h3>
            <div className="space-y-3">
              {content.topTrends.map((trend: TrendItem, index: number) => (
                <div key={index} className="rounded-lg border bg-white p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Ranking Badge */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Keyword */}
                      <h4 className="font-medium text-gray-900 mb-2">{trend.keyword}</h4>

                      {/* Metadata Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          <TrendingUp className="h-3 w-3" />
                          {trend.platform?.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          <Globe className="h-3 w-3" />
                          {trend.country}
                        </span>
                        {trend.formatType && (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                            {trend.formatType}
                          </span>
                        )}
                      </div>

                      {/* Scores */}
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-600">바이럴</span>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            {trend.viralScore}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-600">삼양 연관성</span>
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                            {trend.samyangRelevance}
                          </span>
                        </div>
                      </div>
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

        {/* Top Creators Cards */}
        {content.topCreators && content.topCreators.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              Top {content.topCreators.length} 크리에이터
            </h3>
            <div className="space-y-3">
              {content.topCreators.map((creator: CreatorItem, index: number) => (
                <div key={index} className="rounded-lg border bg-white p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Ranking Badge */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Username */}
                      <h4 className="font-medium text-gray-900 mb-2">@{creator.username}</h4>

                      {/* Metadata Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          <TrendingUp className="h-3 w-3" />
                          {creator.platform?.toUpperCase()}
                        </span>
                        {creator.contentCategory && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {creator.contentCategory}
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-600">브랜드 적합도</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            (creator.brandFitScore ?? 0) >= 80
                              ? 'bg-green-100 text-green-700'
                              : (creator.brandFitScore ?? 0) >= 60
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {creator.brandFitScore ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span className="text-xs font-medium text-gray-900">
                            {creator.followerCount?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-600">참여율</span>
                          <span className="text-xs font-medium text-gray-900">
                            {creator.engagementRate?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </div>
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
              {content.topIdeas.map((idea: IdeaItem, index: number) => (
                <div key={index} className="rounded-lg border bg-white p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Ranking Badge */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-2">{idea.title}</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          <Lightbulb className="h-3 w-3" />
                          {idea.brandCategory}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {idea.tone}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          <Globe className="h-3 w-3" />
                          {idea.targetCountry}
                        </span>
                        {idea.formatType && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
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
            <Button
              variant="outline"
              onClick={() => handleExport('json')}
              disabled={isExporting !== null}
            >
              <FileJson className="mr-2 h-4 w-4" />
              {isExporting === 'json' ? '다운로드 중...' : 'JSON'}
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleExport('pdf')}
              disabled={isExporting !== null}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isExporting === 'pdf' ? '다운로드 중...' : 'PDF 다운로드'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
