/**
 * Creators 테이블 쿼리 함수
 */

import { createServerSupabaseClient } from '@/lib/db/server';
import type {
  Creator,
  CreateCreatorInput,
  UpdateCreatorInput,
  CreatorFilters,
  CreatorResponse,
  CreatorsListResponse,
} from '@/types/creators';

/**
 * Creator 목록 조회 (필터링, 정렬, 페이지네이션 지원)
 */
export async function getCreators(filters: CreatorFilters = {}): Promise<CreatorsListResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from('creators').select('*', { count: 'exact' });

    // 필터 적용
    if (filters.username) {
      query = query.ilike('username', `%${filters.username}%`);
    }

    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }

    if (filters.content_category) {
      query = query.ilike('content_category', `%${filters.content_category}%`);
    }

    if (filters.minFollowerCount !== undefined) {
      query = query.gte('follower_count', filters.minFollowerCount);
    }

    if (filters.minEngagementRate !== undefined) {
      query = query.gte('engagement_rate', filters.minEngagementRate);
    }

    if (filters.minBrandFitScore !== undefined) {
      query = query.gte('brand_fit_score', filters.minBrandFitScore);
    }

    // 사용자별 필터링
    if (filters.userId) {
      query = query.eq('created_by', filters.userId);
    }

    // 정렬
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // 페이지네이션
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching creators:', error);
      return { data: null, error };
    }

    return { data, error: null, count: count || 0 };
  } catch (error) {
    console.error('Unexpected error in getCreators:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 특정 Creator 조회
 */
export async function getCreatorById(id: string): Promise<CreatorResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching creator:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in getCreatorById:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Creator 생성
 */
export async function createCreator(input: CreateCreatorInput): Promise<CreatorResponse> {
  try {
    // 필수 필드 검증
    if (!input.username || !input.platform || !input.profile_url) {
      throw new Error('Username, platform, and profile_url are required');
    }

    // brand_fit_score 범위 검증 (0-100)
    if (input.brand_fit_score !== undefined) {
      if (input.brand_fit_score < 0 || input.brand_fit_score > 100) {
        throw new Error('Brand fit score must be between 0 and 100');
      }
    }

    // engagement_rate 범위 검증 (0-100)
    if (input.engagement_rate !== undefined) {
      if (input.engagement_rate < 0 || input.engagement_rate > 100) {
        throw new Error('Engagement rate must be between 0 and 100');
      }
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('creators')
      .insert([
        {
          username: input.username,
          platform: input.platform,
          profile_url: input.profile_url,
          follower_count: input.follower_count,
          avg_views: input.avg_views,
          engagement_rate: input.engagement_rate,
          content_category: input.content_category,
          tone_manner: input.tone_manner,
          brand_fit_score: input.brand_fit_score,
          collaboration_history: input.collaboration_history,
          risk_factors: input.risk_factors,
          analysis_data: input.analysis_data,
          created_by: input.created_by,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating creator:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in createCreator:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Creator 업데이트
 */
export async function updateCreator(
  id: string,
  input: UpdateCreatorInput
): Promise<CreatorResponse> {
  try {
    // brand_fit_score 범위 검증 (0-100)
    if (input.brand_fit_score !== undefined) {
      if (input.brand_fit_score < 0 || input.brand_fit_score > 100) {
        throw new Error('Brand fit score must be between 0 and 100');
      }
    }

    // engagement_rate 범위 검증 (0-100)
    if (input.engagement_rate !== undefined) {
      if (input.engagement_rate < 0 || input.engagement_rate > 100) {
        throw new Error('Engagement rate must be between 0 and 100');
      }
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('creators')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating creator:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in updateCreator:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Creator 삭제
 */
export async function deleteCreator(id: string): Promise<{ error: Error | null }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('creators').delete().eq('id', id);

    if (error) {
      console.error('Error deleting creator:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error in deleteCreator:', error);
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
