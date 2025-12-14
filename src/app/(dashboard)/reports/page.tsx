'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReportCard } from '@/components/reports/ReportCard';
import { useReports, useCreateReport, useDeleteReport, type Report } from '@/hooks/useReports';
import { useAuthStore } from '@/store/useAuthStore';

// Dynamic import for modal
const ReportDetailModal = dynamic(
  () => import('@/components/reports/ReportDetailModal').then((mod) => ({ default: mod.ReportDetailModal })),
  { ssr: false }
);

export default function ReportsPage() {
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'daily_trend' | 'creator_match' | 'content_idea' | ''>('');
  const [showAll, setShowAll] = useState(false); // 전체 데이터 보기 (기본값: 내 작업만)

  const { data: reportsData, isLoading, refetch } = useReports({ limit: 50, showAll });
  const createReportMutation = useCreateReport();
  const deleteReportMutation = useDeleteReport();

  const handleCreateReport = async (type: 'daily_trend' | 'creator_match' | 'content_idea') => {
    try {
      await createReportMutation.mutateAsync(type);
      refetch();
    } catch (error) {
      console.error('Failed to create report:', error);
      alert('리포트 생성에 실패했습니다.');
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: report.id,
          format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.type}_${report.id.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('다운로드에 실패했습니다.');
    }
  };

  const handleDownloadFromModal = () => {
    if (selectedReport) {
      handleDownloadReport(selectedReport);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('정말 이 리포트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteReportMutation.mutateAsync(reportId);
      refetch();
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert(error instanceof Error ? error.message : '리포트 삭제에 실패했습니다.');
    }
  };

  const reports = reportsData?.data?.reports || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">리포트</h1>
        <p className="mt-2 text-gray-600">
          AI 분석 리포트를 생성하고 관리합니다
        </p>
      </div>

      {/* 리포트 생성 섹션 */}
      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          리포트 생성
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="reportType"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              리포트 유형
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">선택하세요</option>
              <option value="daily_trend">데일리 트렌드 리포트</option>
              <option value="creator_match">크리에이터 매칭 리포트</option>
              <option value="content_idea">콘텐츠 아이디어 리포트</option>
            </select>
          </div>

          <div className="flex justify-end">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!reportType || createReportMutation.isPending}
              onClick={() => reportType && handleCreateReport(reportType)}
            >
              {createReportMutation.isPending ? '생성 중...' : '리포트 생성'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 리포트 목록 섹션 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            생성된 리포트
            {reports.length > 0 && (
              <span className="ml-2 text-gray-500">({reports.length}개)</span>
            )}
          </h2>
          {/* 내 작업 / 전체 토글 */}
          <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white p-1">
            <button
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                !showAll
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setShowAll(false)}
            >
              내 작업
            </button>
            <button
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                showAll
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setShowAll(true)}
            >
              전체
            </button>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-64 animate-pulse bg-gray-100" />
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && reports.length === 0 && (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                생성된 리포트가 없습니다
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                리포트 유형을 선택하고 새 리포트를 생성하세요.
              </p>
            </div>
          </Card>
        )}

        {/* 리포트 카드 그리드 */}
        {!isLoading && reports.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={() => handleViewReport(report)}
                onDownload={() => handleDownloadReport(report)}
                onDelete={() => handleDeleteReport(report.id)}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      <ReportDetailModal
        report={selectedReport}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onDownload={handleDownloadFromModal}
      />
    </div>
  );
}
