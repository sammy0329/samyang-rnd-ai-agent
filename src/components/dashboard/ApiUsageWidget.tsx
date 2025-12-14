'use client';

import { Card } from '@/components/ui/card';
import { useApiUsage } from '@/hooks/useApiUsage';
import { BarChart3 } from 'lucide-react';

export function ApiUsageWidget() {
  const { data, isLoading } = useApiUsage();

  const usage = data?.data;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">API 사용량</h3>
        </div>
        <div className="h-32 animate-pulse rounded bg-gray-100" />
      </Card>
    );
  }

  const totalCalls =
    (usage?.youtube_api_calls || 0) +
    (usage?.serpapi_calls || 0) +
    (usage?.openai_api_calls || 0);

  const youtubePercent = totalCalls
    ? ((usage?.youtube_api_calls || 0) / totalCalls) * 100
    : 0;
  const serpapiPercent = totalCalls
    ? ((usage?.serpapi_calls || 0) / totalCalls) * 100
    : 0;
  const openaiPercent = totalCalls
    ? ((usage?.openai_api_calls || 0) / totalCalls) * 100
    : 0;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">API 사용량</h3>
        </div>
        <span className="text-sm text-gray-500">총 {totalCalls}회</span>
      </div>

      <div className="space-y-4">
        {/* YouTube API */}
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">YouTube API</span>
            <span className="text-gray-500">{usage?.youtube_api_calls || 0}회</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${youtubePercent}%` }}
            />
          </div>
        </div>

        {/* SerpAPI */}
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">SerpAPI</span>
            <span className="text-gray-500">{usage?.serpapi_calls || 0}회</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${serpapiPercent}%` }}
            />
          </div>
        </div>

        {/* OpenAI API */}
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">OpenAI API</span>
            <span className="text-gray-500">{usage?.openai_api_calls || 0}회</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${openaiPercent}%` }}
            />
          </div>
        </div>

        {/* 총 토큰 사용량 */}
        {usage?.total_tokens_used && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">총 토큰 사용량</span>
              <span className="text-gray-900">
                {usage.total_tokens_used.toLocaleString()} tokens
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
