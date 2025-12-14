import { useQuery, UseQueryResult } from '@tanstack/react-query';

interface Scene {
  duration: string;
  description: string;
  camera_angle?: string;
  action: string;
}

interface ExpectedPerformance {
  estimated_views: string;
  estimated_engagement: string;
  virality_potential: 'high' | 'medium' | 'low';
}

export interface ContentIdea {
  id: string;
  title: string;
  brand_category: string;
  tone: string;
  format_type?: string;
  platform?: string;
  hook_text: string;
  hook_visual?: string;
  scene_structure: Scene[] | Record<string, unknown>;
  editing_format: string;
  music_style: string;
  props_needed: string[];
  target_country: string;
  expected_performance: ExpectedPerformance | Record<string, unknown>;
  hashtags?: string[];
  production_tips?: string[];
  common_mistakes?: string[];
  created_at: string;
}

interface ContentIdeasFilters {
  brandCategory?: string;
  tone?: string;
  targetCountry?: string;
  limit?: number;
  offset?: number;
}

interface ContentIdeasResponse {
  success: boolean;
  data: {
    ideas: ContentIdea[];
    total: number;
    filters: ContentIdeasFilters;
  };
}

/**
 * Fetch content ideas from the API
 */
async function fetchContentIdeas(
  filters: ContentIdeasFilters
): Promise<ContentIdeasResponse> {
  const params = new URLSearchParams();

  if (filters.brandCategory) params.append('brandCategory', filters.brandCategory);
  if (filters.tone) params.append('tone', filters.tone);
  if (filters.targetCountry) params.append('targetCountry', filters.targetCountry);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await fetch(`/api/content?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch content ideas');
  }

  return response.json();
}

/**
 * React Query hook for content ideas
 */
export function useContentIdeas(
  filters: ContentIdeasFilters = {}
): UseQueryResult<ContentIdeasResponse, Error> {
  return useQuery({
    queryKey: ['contentIdeas', filters],
    queryFn: () => fetchContentIdeas(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
