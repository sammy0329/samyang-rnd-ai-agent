import { useQuery, UseQueryResult } from '@tanstack/react-query';

interface ApiUsageData {
  youtube_api_calls: number;
  serpapi_calls: number;
  openai_api_calls: number;
  total_tokens_used: number;
  period_start: string;
  period_end: string;
}

interface ApiUsageResponse {
  success: boolean;
  data: ApiUsageData;
}

/**
 * Fetch API usage statistics
 */
async function fetchApiUsage(): Promise<ApiUsageResponse> {
  const response = await fetch('/api/usage');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch API usage');
  }

  return response.json();
}

/**
 * React Query hook for API usage
 */
export function useApiUsage(): UseQueryResult<ApiUsageResponse, Error> {
  return useQuery({
    queryKey: ['apiUsage'],
    queryFn: fetchApiUsage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Fetch combined API usage statistics (user + system)
 */
async function fetchApiUsageCombined(): Promise<import('@/types/api-usage').ApiUsageCombinedResponse> {
  const response = await fetch('/api/usage?type=combined');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch combined API usage');
  }

  return response.json();
}

/**
 * React Query hook for combined API usage (user + system stats)
 */
export function useApiUsageCombined(): UseQueryResult<import('@/types/api-usage').ApiUsageCombinedResponse, Error> {
  return useQuery({
    queryKey: ['apiUsage', 'combined'],
    queryFn: fetchApiUsageCombined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// API Quota Response type
interface ApiQuotaServiceStats {
  service: 'youtube' | 'gpt';
  currentUsage: number;
  maxLimit: number;
  usagePercentage: number;
  unit: string;
  calls: number;
}

interface ApiQuotaResponse {
  success: boolean;
  data: {
    youtube: ApiQuotaServiceStats;
    gpt: ApiQuotaServiceStats;
    updatedAt: string;
  };
}

/**
 * Fetch API quota statistics (YouTube & GPT daily limits)
 */
async function fetchApiQuota(): Promise<ApiQuotaResponse> {
  const response = await fetch('/api/usage?type=quota');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch API quota');
  }

  return response.json();
}

/**
 * React Query hook for API quota (YouTube & GPT usage vs limits)
 */
export function useApiQuota(): UseQueryResult<ApiQuotaResponse, Error> {
  return useQuery({
    queryKey: ['apiUsage', 'quota'],
    queryFn: fetchApiQuota,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for quota)
    retry: 1,
  });
}
