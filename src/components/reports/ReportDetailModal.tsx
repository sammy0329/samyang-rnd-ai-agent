'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Report } from '@/hooks/useReports';

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

export function ReportDetailModal({
  report,
  open,
  onOpenChange,
  onDownload,
}: ReportDetailModalProps) {
  if (!report) return null;

  const content = report.content as any;
  const typeLabel = REPORT_TYPE_LABELS[report.type] || report.type;

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

          {/* 요약 */}
          {content.summary && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">요약</h3>
              <div className="rounded-lg border bg-white p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {JSON.stringify(content.summary, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Top 항목 */}
          {(content.topTrends || content.topCreators || content.topIdeas) && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">주요 항목</h3>
              <div className="space-y-2">
                {(content.topTrends || content.topCreators || content.topIdeas || []).map((item: any, index: number) => (
                  <div key={index} className="rounded-lg border bg-white p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

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
