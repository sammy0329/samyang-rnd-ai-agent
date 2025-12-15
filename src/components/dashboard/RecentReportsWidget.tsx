'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { useReports, Report } from '@/hooks/useReports';
import Link from 'next/link';
import { FileText, TrendingUp, Users, Lightbulb } from 'lucide-react';

// Dynamic import for modal
const ReportDetailModal = dynamic(
  () => import('@/components/reports/ReportDetailModal').then((mod) => ({ default: mod.ReportDetailModal })),
  { ssr: false }
);

interface RecentReportsWidgetProps {
  showAll?: boolean;
}

const REPORT_TYPE_CONFIG = {
  daily_trend: {
    label: '데일리 트렌드',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  creator_match: {
    label: '크리에이터 매칭',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  content_idea: {
    label: '콘텐츠 아이디어',
    icon: Lightbulb,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
};

export function RecentReportsWidget({ showAll = true }: RecentReportsWidgetProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useReports({
    limit: 3,
    showAll,
  });

  const reports = data?.data?.reports || [];

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">최근 리포트</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">최근 리포트</h3>
          </div>
          <Link
            href="/reports"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            전체 보기
          </Link>
        </div>

        {reports.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            생성된 리포트가 없습니다
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const config = REPORT_TYPE_CONFIG[report.type];
              const Icon = config.icon;
              const createdAt = new Date(report.created_at).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={report.id}
                  onClick={() => handleReportClick(report)}
                  className="group flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 hover:border-purple-300"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-600">
                      {report.title}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span className={`rounded-full px-2 py-0.5 ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                      <span>{createdAt}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
