'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Report } from '@/hooks/useReports';

interface ReportCardProps {
  report: Report;
  onView: () => void;
  onDownload: () => void;
  onDelete?: () => void;
  currentUserId?: string;
}

const REPORT_TYPE_LABELS: Record<string, { title: string; color: string }> = {
  daily_trend: { title: '데일리 트렌드', color: 'bg-blue-100 text-blue-800' },
  creator_match: { title: '크리에이터 매칭', color: 'bg-green-100 text-green-800' },
  content_idea: { title: '콘텐츠 아이디어', color: 'bg-purple-100 text-purple-800' },
};

export function ReportCard({ report, onView, onDownload, onDelete, currentUserId }: ReportCardProps) {
  const typeConfig = REPORT_TYPE_LABELS[report.type] || { title: report.type, color: 'bg-gray-100 text-gray-800' };
  const createdDate = new Date(report.created_at).toLocaleDateString('ko-KR');

  // 미리보기 데이터 추출
  const content = report.content as any;
  const preview = {
    date: content.date || '날짜 없음',
    total: content.totalTrends || content.totalCreators || content.totalIdeas || 0,
    summary: content.summary || {},
  };

  // 삭제 버튼 표시: onDelete가 있으면 표시 (서버에서 권한 체크)
  const canDelete = !!onDelete;

  return (
    <Card className="group relative overflow-hidden p-6 transition-all hover:shadow-lg">
      {/* 삭제 버튼 - 우측 상단 */}
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 hover:shadow-md"
          title="삭제"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
      <div className="mb-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${typeConfig.color}`}>
              {typeConfig.title}
            </span>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">
              {report.title}
            </h3>
          </div>
        </div>
        <p className="text-sm text-gray-500">{createdDate} 생성</p>
      </div>

      {/* 미리보기 정보 */}
      <div className="mb-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">날짜:</span>
          <span className="font-medium text-gray-900">{preview.date}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">항목 수:</span>
          <span className="font-medium text-gray-900">{preview.total}개</span>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onView}
        >
          상세 보기
        </Button>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onDownload}
        >
          다운로드
        </Button>
      </div>
    </Card>
  );
}
