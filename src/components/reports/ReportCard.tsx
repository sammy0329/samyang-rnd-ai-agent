'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Report } from '@/hooks/useReports';
import { exportReport } from '@/hooks/useReports';
import { FileJson, FileText } from 'lucide-react';

interface ReportCardProps {
  report: Report;
  onView: () => void;
  onDownload?: () => void; // Deprecated, kept for backwards compatibility
  onDelete?: () => void;
  currentUserId?: string;
}

const REPORT_TYPE_LABELS: Record<string, { title: string; color: string }> = {
  daily_trend: { title: '데일리 트렌드', color: 'bg-blue-100 text-blue-800' },
  creator_match: { title: '크리에이터 매칭', color: 'bg-green-100 text-green-800' },
  content_idea: { title: '콘텐츠 아이디어', color: 'bg-purple-100 text-purple-800' },
};

export function ReportCard({ report, onView, onDelete }: ReportCardProps) {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<'json' | 'pdf' | null>(null);

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

  const handleExport = async (format: 'json' | 'pdf') => {
    setIsExporting(format);
    try {
      await exportReport(report.id, format);
      setIsDownloadModalOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <>
      <Card
        className="group relative overflow-hidden p-6 transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
        onClick={onView}
      >
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
              <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
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
        <div>
          <Button
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              setIsDownloadModalOpen(true);
            }}
          >
            다운로드
          </Button>
        </div>
      </Card>

      {/* 다운로드 형식 선택 모달 */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>다운로드 형식 선택</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="outline"
              className="h-14 justify-start gap-3"
              onClick={() => handleExport('json')}
              disabled={isExporting !== null}
            >
              <FileJson className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <p className="font-medium">JSON 형식</p>
                <p className="text-xs text-gray-500">데이터 분석용 원본 형식</p>
              </div>
              {isExporting === 'json' && (
                <span className="ml-auto text-sm text-gray-500">다운로드 중...</span>
              )}
            </Button>
            <Button
              variant="outline"
              className="h-14 justify-start gap-3"
              onClick={() => handleExport('pdf')}
              disabled={isExporting !== null}
            >
              <FileText className="h-6 w-6 text-red-600" />
              <div className="text-left">
                <p className="font-medium">PDF 형식</p>
                <p className="text-xs text-gray-500">보고서 공유용 문서 형식</p>
              </div>
              {isExporting === 'pdf' && (
                <span className="ml-auto text-sm text-gray-500">다운로드 중...</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
