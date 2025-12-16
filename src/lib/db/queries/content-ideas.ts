/**
 * Content Ideas 테이블 쿼리 함수
 */

import { createServerSupabaseClient, createAdminClient } from '@/lib/db/server';
import type {
  ContentIdea,
  CreateContentIdeaInput,
  UpdateContentIdeaInput,
  ContentIdeaFilters,
  ContentIdeaResponse,
  ContentIdeasListResponse,
} from '@/types/content';

/**
 * Content Idea 목록 조회 (필터링, 정렬, 페이지네이션 지원)
 */
export async function getContentIdeas(
  filters: ContentIdeaFilters = {}
): Promise<ContentIdeasListResponse> {
  try {
    // 데모 모드에서는 Admin Client 사용 (RLS 우회)
    const isDemoMode = process.env.DEMO_MODE === 'true';
    const supabase = isDemoMode ? createAdminClient() : await createServerSupabaseClient();
    let query = supabase.from('content_ideas').select('*', { count: 'exact' });

    // 필터 적용
    if (filters.trend_id) {
      query = query.eq('trend_id', filters.trend_id);
    }

    if (filters.brand_category) {
      query = query.eq('brand_category', filters.brand_category);
    }

    if (filters.tone) {
      query = query.eq('tone', filters.tone);
    }

    if (filters.target_country) {
      query = query.eq('target_country', filters.target_country);
    }

    if (filters.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    // 정렬
    const sortBy = filters.sortBy || 'generated_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // 페이지네이션
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching content ideas:', error);
      return { data: null, error };
    }

    return { data, error: null, count: count || 0 };
  } catch (error) {
    console.error('Unexpected error in getContentIdeas:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 특정 Content Idea 조회
 */
export async function getContentIdeaById(id: string): Promise<ContentIdeaResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('content_ideas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching content idea:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in getContentIdeaById:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Content Idea 생성
 */
export async function createContentIdea(
  input: CreateContentIdeaInput
): Promise<ContentIdeaResponse> {
  try {
    // 필수 필드 검증
    if (!input.title) {
      throw new Error('Title is required');
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('content_ideas')
      .insert([
        {
          trend_id: input.trend_id,
          title: input.title,
          brand_category: input.brand_category,
          tone: input.tone,
          format_type: input.format_type,
          platform: input.platform,
          hook_text: input.hook_text,
          hook_visual: input.hook_visual,
          scene_structure: input.scene_structure,
          editing_format: input.editing_format,
          music_style: input.music_style,
          props_needed: input.props_needed,
          hashtags: input.hashtags,
          target_country: input.target_country,
          expected_performance: input.expected_performance,
          production_tips: input.production_tips,
          common_mistakes: input.common_mistakes,
          created_by: input.created_by,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating content idea:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in createContentIdea:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Content Idea 업데이트
 */
export async function updateContentIdea(
  id: string,
  input: UpdateContentIdeaInput
): Promise<ContentIdeaResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('content_ideas')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content idea:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in updateContentIdea:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Content Idea 삭제
 */
export async function deleteContentIdea(id: string): Promise<{ error: Error | null }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('content_ideas').delete().eq('id', id);

    if (error) {
      console.error('Error deleting content idea:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error in deleteContentIdea:', error);
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
