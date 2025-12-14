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
