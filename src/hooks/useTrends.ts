import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Trend } from '@/types/trends';

interface TrendsQueryParams {
  keyword?: string;
  platform?: string;
  country?: string;
  minViralScore?: number;
  minSamyangRelevance?: number;
  sortBy?: 'collected_at' | 'viral_score' | 'samyang_relevance' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface TrendsResponse {
  success: boolean;
  data: {
    trends: Trend[];
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * 트렌드 목록을 가져오는 React Query hook
 */
export function useTrends(params: TrendsQueryParams = {}) {
  return useQuery({
    queryKey: ['trends', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();

      const url = `/api/trends${queryString ? `?${queryString}` : ''}`;
      const response = await axios.get<TrendsResponse>(url);

      if (!response.data.success) {
        throw new Error('Failed to fetch trends');
      }

      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5분간 fresh
    gcTime: 1000 * 60 * 10, // 10분간 캐시 유지 (구 cacheTime)
  });
}
