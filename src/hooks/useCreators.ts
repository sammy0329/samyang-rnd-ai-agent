import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Creator } from '@/types/creators';

interface CreatorsQueryParams {
  username?: string;
  platform?: 'tiktok' | 'instagram' | 'youtube';
  content_category?: string;
  minFollowerCount?: number;
  minEngagementRate?: number;
  minBrandFitScore?: number;
  sortBy?: 'follower_count' | 'engagement_rate' | 'brand_fit_score' | 'last_analyzed_at' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface CreatorsResponse {
  success: boolean;
  data: {
    creators: Creator[];
    total: number;
    filters: CreatorsQueryParams;
  };
}

/**
 * React Query hook for fetching creators
 *
 * @param params - Query parameters for filtering, sorting, and pagination
 * @returns Query result with creators data
 *
 * @example
 * const { data, isLoading, error } = useCreators({
 *   platform: 'youtube',
 *   minBrandFitScore: 80,
 *   sortBy: 'brand_fit_score',
 *   sortOrder: 'desc',
 * });
 */
export function useCreators(params: CreatorsQueryParams = {}) {
  return useQuery({
    queryKey: ['creators', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();

      const url = `/api/creators${queryString ? `?${queryString}` : ''}`;
      const response = await axios.get<CreatorsResponse>(url);

      if (!response.data.success) {
        throw new Error('Failed to fetch creators');
      }

      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5분간 fresh
    gcTime: 1000 * 60 * 10, // 10분간 캐시 유지
  });
}
