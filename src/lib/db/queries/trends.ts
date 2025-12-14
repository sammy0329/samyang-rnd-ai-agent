/**
 * Trends 테이블 쿼리 함수
 *
 * 트렌드 데이터 CRUD 작업을 위한 함수들
 */

import { createServerSupabaseClient, createAdminClient } from '@/lib/db/server';
import {
  Trend,
  CreateTrendInput,
  UpdateTrendInput,
  TrendFilters,
  TrendResponse,
  TrendsListResponse,
} from '@/types/trends';

/**
 * 트렌드 목록 조회
 *
 * @param filters - 필터 및 정렬 옵션
 * @returns 트렌드 목록 및 총 개수
 */
export async function getTrends(filters: TrendFilters = {}): Promise<TrendsListResponse> {
  try {
    const supabase = await createServerSupabaseClient();

    let query = supabase.from('trends').select('*', { count: 'exact' });

    // 필터 적용
    if (filters.keyword) {
      query = query.ilike('keyword', `%${filters.keyword}%`);
    }

    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.minViralScore !== undefined) {
      query = query.gte('viral_score', filters.minViralScore);
    }

    if (filters.minSamyangRelevance !== undefined) {
      query = query.gte('samyang_relevance', filters.minSamyangRelevance);
    }

    // 정렬
    const sortBy = filters.sortBy || 'collected_at';
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
      data: data as Trend[],
      error: null,
      count: count || 0,
    };
  } catch (error) {
    console.error('Get trends error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get trends'),
    };
  }
}

/**
 * 단일 트렌드 조회
 *
 * @param id - 트렌드 ID
 * @returns 트렌드 데이터
 */
export async function getTrendById(id: string): Promise<TrendResponse> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.from('trends').select('*').eq('id', id).single();

    if (error) {
      throw error;
    }

    return {
      data: data as Trend,
      error: null,
    };
  } catch (error) {
    console.error('Get trend by ID error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get trend'),
    };
  }
}

/**
 * 트렌드 생성
 *
 * @param input - 트렌드 생성 데이터
 * @returns 생성된 트렌드
 */
export async function createTrend(input: CreateTrendInput): Promise<TrendResponse> {
  try {
    // API 경로에서 호출되므로 Admin Client 사용 (RLS 우회)
    const supabase = createAdminClient();

    // 데이터 검증
    if (!input.keyword || !input.platform) {
      throw new Error('Keyword and platform are required');
    }

    // viral_score와 samyang_relevance 범위 검증 (0-100)
    if (input.viral_score !== undefined) {
      if (input.viral_score < 0 || input.viral_score > 100) {
        throw new Error('Viral score must be between 0 and 100');
      }
    }

    if (input.samyang_relevance !== undefined) {
      if (input.samyang_relevance < 0 || input.samyang_relevance > 100) {
        throw new Error('Samyang relevance must be between 0 and 100');
      }
    }

    // 한국 시간대(KST, UTC+9)의 현재 시간을 ISO 형식으로 변환
    const getKoreaTimeISO = (): string => {
      const now = new Date();
      // 한국 시간대의 현재 시간을 얻기 위해 UTC+9 오프셋 적용
      const koreaOffset = 9 * 60; // 9시간을 분으로 변환
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const koreaTime = new Date(utc + koreaOffset * 60000);

      // ISO 형식으로 변환 (YYYY-MM-DDTHH:MM:SS)
      const year = koreaTime.getFullYear();
      const month = String(koreaTime.getMonth() + 1).padStart(2, '0');
      const day = String(koreaTime.getDate()).padStart(2, '0');
      const hours = String(koreaTime.getHours()).padStart(2, '0');
      const minutes = String(koreaTime.getMinutes()).padStart(2, '0');
      const seconds = String(koreaTime.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const koreaTime = getKoreaTimeISO();

    const { data, error } = await supabase
      .from('trends')
      .insert([
        {
          keyword: input.keyword,
          platform: input.platform,
          country: input.country || 'KR',
          format_type: input.format_type,
          hook_pattern: input.hook_pattern,
          visual_pattern: input.visual_pattern,
          music_pattern: input.music_pattern,
          viral_score: input.viral_score,
          samyang_relevance: input.samyang_relevance,
          analysis_data: input.analysis_data,
          created_at: koreaTime,
          collected_at: koreaTime, // 수집 시간도 한국 시간대로 설정
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      data: data as Trend,
      error: null,
    };
  } catch (error) {
    console.error('Create trend error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to create trend'),
    };
  }
}

/**
 * 트렌드 업데이트
 *
 * @param id - 트렌드 ID
 * @param input - 업데이트할 데이터
 * @returns 업데이트된 트렌드
 */
export async function updateTrend(id: string, input: UpdateTrendInput): Promise<TrendResponse> {
  try {
    const supabase = await createServerSupabaseClient();

    // 빈 업데이트 방지
    if (Object.keys(input).length === 0) {
      throw new Error('No update data provided');
    }

    // viral_score와 samyang_relevance 범위 검증 (0-100)
    if (input.viral_score !== undefined) {
      if (input.viral_score < 0 || input.viral_score > 100) {
        throw new Error('Viral score must be between 0 and 100');
      }
    }

    if (input.samyang_relevance !== undefined) {
      if (input.samyang_relevance < 0 || input.samyang_relevance > 100) {
        throw new Error('Samyang relevance must be between 0 and 100');
      }
    }

    const { data, error } = await supabase
      .from('trends')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      data: data as Trend,
      error: null,
    };
  } catch (error) {
    console.error('Update trend error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update trend'),
    };
  }
}

/**
 * 트렌드 삭제
 *
 * @param id - 트렌드 ID
 * @returns 성공 여부
 */
export async function deleteTrend(id: string): Promise<TrendResponse> {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from('trends').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return {
      data: null,
      error: null,
    };
  } catch (error) {
    console.error('Delete trend error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to delete trend'),
    };
  }
}
