/**
 * Content Ideas 테이블 쿼리 함수
 *
 * 콘텐츠 아이디어 데이터 CRUD 작업을 위한 함수들
 */

import { createServerSupabaseClient, createAdminClient } from '@/lib/db/server';
import {
  ContentIdea,
  CreateContentIdeaInput,
  UpdateContentIdeaInput,
  ContentIdeaFilters,
  ContentIdeaResponse,
  ContentIdeasListResponse,
} from '@/types/content';

/**
 * 콘텐츠 아이디어 목록 조회
 *
 * @param filters - 필터 및 정렬 옵션
 * @returns 콘텐츠 아이디어 목록 및 총 개수
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
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      data: data as ContentIdea[],
      error: null,
      count: count || 0,
    };
  } catch (error) {
    console.error('Get content ideas error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get content ideas'),
    };
  }
}

/**
 * 단일 콘텐츠 아이디어 조회
 *
 * @param id - 콘텐츠 아이디어 ID
 * @returns 콘텐츠 아이디어 데이터
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
      throw error;
    }

    return {
      data: data as ContentIdea,
      error: null,
    };
  } catch (error) {
    console.error('Get content idea by ID error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get content idea'),
    };
  }
}

/**
 * 콘텐츠 아이디어 생성
 *
 * @param input - 콘텐츠 아이디어 생성 데이터
 * @returns 생성된 콘텐츠 아이디어
 */
export async function createContentIdea(
  input: CreateContentIdeaInput
): Promise<ContentIdeaResponse> {
  try {
    // API 경로에서 호출되므로 Admin Client 사용 (RLS 우회)
    const supabase = createAdminClient();

    // 데이터 검증
    if (!input.title) {
      throw new Error('Title is required');
    }

    const { data, error } = await supabase
      .from('content_ideas')
      .insert([
        {
          trend_id: input.trend_id || null,
          title: input.title,
          brand_category: input.brand_category || null,
          tone: input.tone || null,
          format_type: input.format_type || null,
          platform: input.platform || null,
          hook_text: input.hook_text || null,
          hook_visual: input.hook_visual || null,
          scene_structure: input.scene_structure || null,
          editing_format: input.editing_format || null,
          music_style: input.music_style || null,
          props_needed: input.props_needed || null,
          hashtags: input.hashtags || null,
          target_country: input.target_country || null,
          expected_performance: input.expected_performance || null,
          production_tips: input.production_tips || null,
          common_mistakes: input.common_mistakes || null,
          created_by: input.created_by || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      data: data as ContentIdea,
      error: null,
    };
  } catch (error) {
    console.error('Create content idea error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to create content idea'),
    };
  }
}

/**
 * 콘텐츠 아이디어 업데이트
 *
 * @param id - 콘텐츠 아이디어 ID
 * @param input - 업데이트할 데이터
 * @returns 업데이트된 콘텐츠 아이디어
 */
export async function updateContentIdea(
  id: string,
  input: UpdateContentIdeaInput
): Promise<ContentIdeaResponse> {
  try {
    const supabase = await createServerSupabaseClient();

    // 빈 업데이트 방지
    if (Object.keys(input).length === 0) {
      throw new Error('No update data provided');
    }

    const { data, error } = await supabase
      .from('content_ideas')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      data: data as ContentIdea,
      error: null,
    };
  } catch (error) {
    console.error('Update content idea error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update content idea'),
    };
  }
}

/**
 * 콘텐츠 아이디어 삭제
 *
 * @param id - 콘텐츠 아이디어 ID
 * @returns 성공 여부
 */
export async function deleteContentIdea(id: string): Promise<ContentIdeaResponse> {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from('content_ideas').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return {
      data: null,
      error: null,
    };
  } catch (error) {
    console.error('Delete content idea error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to delete content idea'),
    };
  }
}
