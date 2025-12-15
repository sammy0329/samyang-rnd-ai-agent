'use client';

import { Card } from '@/components/ui/card';
import { useApiQuota } from '@/hooks/useApiUsage';
import { BarChart3, Play, Cpu } from 'lucide-react';

// Helper functions
function getProgressColor(percentage: number): string {
  if (percentage < 50) return 'bg-green-500';
  if (percentage < 75) return 'bg-yellow-500';
  if (percentage < 90) return 'bg-orange-500';
  return 'bg-red-500';
}

function getProgressBgColor(percentage: number): string {
  if (percentage < 50) return 'bg-green-100';
  if (percentage < 75) return 'bg-yellow-100';
  if (percentage < 90) return 'bg-orange-100';
  return 'bg-red-100';
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('ko-KR');
}

// Service quota display component
interface QuotaBarProps {
  icon: React.ReactNode;
  label: string;
  currentUsage: number;
  maxLimit: number;
  unit: string;
  calls: number;
}

function QuotaBar({ icon, label, currentUsage, maxLimit, unit, calls }: QuotaBarProps) {
  const percentage = maxLimit > 0 ? Math.min((currentUsage / maxLimit) * 100, 100) : 0;
  const progressColor = getProgressColor(percentage);
  const progressBgColor = getProgressBgColor(percentage);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-xs text-gray-500">{calls}회 호출</span>
      </div>

      {/* Usage numbers */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{formatNumber(currentUsage)}</span>
        <span className="text-sm text-gray-500">/ {formatNumber(maxLimit)} {unit}</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className={`h-4 w-full overflow-hidden rounded-full ${progressBgColor}`}>
          <div
            className={`h-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} 사용량`}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={percentage >= 90 ? 'font-medium text-red-600' : 'text-gray-500'}>
            {percentage.toFixed(1)}% 사용
          </span>
          <span className="text-gray-500">
            {formatNumber(maxLimit - currentUsage)} {unit} 남음
          </span>
        </div>
      </div>
    </div>
  );
}

export function ApiUsageWidget() {
  const { data, isLoading, error } = useApiQuota();

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">API 사용량</h3>
          </div>
        </div>
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">API 사용량</h3>
          </div>
        </div>
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <p className="mt-1 text-xs text-red-600">{error.message}</p>
        </div>
      </Card>
    );
  }

  const youtube = data?.data?.youtube;
  const gpt = data?.data?.gpt;

  // No data state
  if (!youtube || !gpt) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">API 사용량</h3>
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">아직 API 사용 기록이 없습니다</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">API 사용량</h3>
        </div>
        <span className="text-xs text-gray-400">오늘 기준</span>
      </div>

      <div className="space-y-6">
        {/* YouTube API Usage */}
        <QuotaBar
          icon={<Play className="h-5 w-5 text-red-500" />}
          label="YouTube API"
          currentUsage={youtube.currentUsage}
          maxLimit={youtube.maxLimit}
          unit={youtube.unit}
          calls={youtube.calls}
        />

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* GPT API Usage */}
        <QuotaBar
          icon={<Cpu className="h-5 w-5 text-emerald-500" />}
          label="GPT API"
          currentUsage={gpt.currentUsage}
          maxLimit={gpt.maxLimit}
          unit={gpt.unit}
          calls={gpt.calls}
        />
      </div>
    </Card>
  );
}
