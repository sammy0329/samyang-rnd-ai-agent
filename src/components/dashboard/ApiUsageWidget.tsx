'use client';

import { Card } from '@/components/ui/card';
import { useApiUsageCombined } from '@/hooks/useApiUsage';
import { BarChart3 } from 'lucide-react';

// Helper functions
function getProgressColor(percentage: number): string {
  if (percentage < 25) return 'bg-green-500';
  if (percentage < 50) return 'bg-blue-500';
  if (percentage < 75) return 'bg-yellow-500';
  return 'bg-orange-500';
}

function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${tokens}`;
}

// Reusable metric component
interface UsageMetricProps {
  label: string;
  teamTotal: number;
  userAmount: number;
  formatter: (num: number) => string;
}

function UsageMetric({ label, teamTotal, userAmount, formatter }: UsageMetricProps) {
  const percentage = teamTotal > 0 ? Math.min((userAmount / teamTotal) * 100, 100) : 0;
  const progressColor = getProgressColor(percentage);

  // Handle edge case: user usage > team usage
  if (userAmount > teamTotal && teamTotal > 0) {
    console.warn(`User ${label} exceeds team total - possible data inconsistency`);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-500">팀 전체</span>
      </div>
      <div className="text-2xl font-semibold text-gray-900">{formatter(teamTotal)}</div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all ${progressColor}`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} 사용 비율`}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>내 사용량: {formatter(userAmount)}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

export function ApiUsageWidget() {
  const { data, isLoading, error } = useApiUsageCombined();

  const userStats = data?.data?.user;
  const systemStats = data?.data?.system;

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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-full animate-pulse rounded-full bg-gray-200" />
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

  // No data state
  if (!systemStats || !userStats) {
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
      </div>

      <div className="space-y-6">
        {/* Total API Calls */}
        <UsageMetric
          label="총 호출 횟수"
          teamTotal={systemStats.totalCalls}
          userAmount={userStats.totalCalls}
          formatter={formatNumber}
        />

        {/* Total Tokens Used */}
        <UsageMetric
          label="총 토큰 사용량"
          teamTotal={systemStats.totalTokens}
          userAmount={userStats.totalTokens}
          formatter={(tokens) => `${formatTokens(tokens)} tokens`}
        />

        {/* Total Cost */}
        <UsageMetric
          label="총 비용"
          teamTotal={systemStats.totalCost}
          userAmount={userStats.totalCost}
          formatter={formatCost}
        />
      </div>
    </Card>
  );
}
