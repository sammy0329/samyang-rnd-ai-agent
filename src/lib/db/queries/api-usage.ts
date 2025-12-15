/**
 * API Usage 테이블 쿼리 함수
 */

import { createServerSupabaseClient, createAdminClient } from '@/lib/db/server';
import type {
  APIUsage,
  CreateAPIUsageInput,
  APIUsageFilters,
  APIUsageResponse,
  APIUsageListResponse,
  UsageStats,
  UsageStatsResponse,
} from '@/types/api-usage';

/**
 * API Usage 기록 생성
 */
export async function createAPIUsage(
  input: CreateAPIUsageInput
): Promise<APIUsageResponse> {
  try {
    // Admin Client 사용 (RLS 우회, API 사용량 기록용)
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('api_usage')
      .insert([
        {
          user_id: input.user_id,
          endpoint: input.endpoint,
          method: input.method,
          tokens_used: input.tokens_used,
          cost: input.cost,
          response_time_ms: input.response_time_ms,
          status_code: input.status_code,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating API usage:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in createAPIUsage:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * API Usage 목록 조회
 */
export async function getAPIUsage(
  filters: APIUsageFilters = {}
): Promise<APIUsageListResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from('api_usage').select('*', { count: 'exact' });

    // 필터 적용
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.endpoint) {
      query = query.eq('endpoint', filters.endpoint);
    }

    if (filters.method) {
      query = query.eq('method', filters.method);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // 정렬
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // 페이지네이션
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching API usage:', error);
      return { data: null, error };
    }

    return { data, error: null, count: count || 0 };
  } catch (error) {
    console.error('Unexpected error in getAPIUsage:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 사용자별 API Usage 통계
 */
export async function getUserUsageStats(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<UsageStatsResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('api_usage')
      .select('tokens_used, cost, response_time_ms, status_code')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching usage stats:', error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      return {
        data: {
          totalCalls: 0,
          totalTokens: 0,
          totalCost: 0,
          avgResponseTime: 0,
          successRate: 0,
        },
        error: null,
      };
    }

    // 통계 계산
    const totalCalls = data.length;
    const totalTokens = data.reduce((sum, row) => sum + (row.tokens_used || 0), 0);
    const totalCost = data.reduce((sum, row) => sum + (row.cost || 0), 0);
    const avgResponseTime =
      data.reduce((sum, row) => sum + (row.response_time_ms || 0), 0) / totalCalls;
    const successCount = data.filter(
      (row) => row.status_code && row.status_code >= 200 && row.status_code < 300
    ).length;
    const successRate = (successCount / totalCalls) * 100;

    return {
      data: {
        totalCalls,
        totalTokens,
        totalCost: parseFloat(totalCost.toFixed(4)),
        avgResponseTime: Math.round(avgResponseTime),
        successRate: parseFloat(successRate.toFixed(2)),
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error in getUserUsageStats:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 전체 시스템 사용량 통계 (Admin용)
 */
export async function getSystemUsageStats(
  startDate?: string,
  endDate?: string
): Promise<UsageStatsResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('api_usage')
      .select('tokens_used, cost, response_time_ms, status_code');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching system usage stats:', error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      return {
        data: {
          totalCalls: 0,
          totalTokens: 0,
          totalCost: 0,
          avgResponseTime: 0,
          successRate: 0,
        },
        error: null,
      };
    }

    // 통계 계산
    const totalCalls = data.length;
    const totalTokens = data.reduce((sum, row) => sum + (row.tokens_used || 0), 0);
    const totalCost = data.reduce((sum, row) => sum + (row.cost || 0), 0);
    const avgResponseTime =
      data.reduce((sum, row) => sum + (row.response_time_ms || 0), 0) / totalCalls;
    const successCount = data.filter(
      (row) => row.status_code && row.status_code >= 200 && row.status_code < 300
    ).length;
    const successRate = (successCount / totalCalls) * 100;

    return {
      data: {
        totalCalls,
        totalTokens,
        totalCost: parseFloat(totalCost.toFixed(4)),
        avgResponseTime: Math.round(avgResponseTime),
        successRate: parseFloat(successRate.toFixed(2)),
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error in getSystemUsageStats:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 서비스별 사용량 통계 (YouTube, GPT)
 * YouTube: /api/trends/analyze 엔드포인트에 저장된 실제 quota 값 사용
 * GPT: ai/* 엔드포인트의 토큰 사용량
 */
export async function getServiceUsageStats(
  service: 'youtube' | 'gpt',
  startDate?: string,
  endDate?: string
): Promise<{ data: { usage: number; calls: number } | null; error: Error | null }> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('api_usage')
      .select('endpoint, tokens_used, status_code');

    // 서비스별 엔드포인트 필터링
    if (service === 'youtube') {
      // YouTube API는 trends/analyze 엔드포인트에서 사용
      query = query.like('endpoint', '%trends/analyze%');
    } else if (service === 'gpt') {
      // GPT API는 ai/* 또는 content/generate 엔드포인트에서 사용
      query = query.or('endpoint.like.ai/%,endpoint.like.%content/generate%');
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // 성공한 요청만 카운트 (status_code 200-299)
    query = query.gte('status_code', 200).lt('status_code', 300);

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching ${service} usage stats:`, error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      return { data: { usage: 0, calls: 0 }, error: null };
    }

    const calls = data.length;
    // 실제 저장된 tokens_used 값 합계 (YouTube quota units 또는 GPT tokens)
    const usage = data.reduce((sum, row) => sum + (row.tokens_used || 0), 0);

    return { data: { usage, calls }, error: null };
  } catch (error) {
    console.error(`Unexpected error in getServiceUsageStats (${service}):`, error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 엔드포인트별 사용량 통계
 */
export async function getEndpointUsageStats(
  endpoint: string,
  startDate?: string,
  endDate?: string
): Promise<UsageStatsResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('api_usage')
      .select('tokens_used, cost, response_time_ms, status_code')
      .eq('endpoint', endpoint);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching endpoint usage stats:', error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      return {
        data: {
          totalCalls: 0,
          totalTokens: 0,
          totalCost: 0,
          avgResponseTime: 0,
          successRate: 0,
        },
        error: null,
      };
    }

    // 통계 계산
    const totalCalls = data.length;
    const totalTokens = data.reduce((sum, row) => sum + (row.tokens_used || 0), 0);
    const totalCost = data.reduce((sum, row) => sum + (row.cost || 0), 0);
    const avgResponseTime =
      data.reduce((sum, row) => sum + (row.response_time_ms || 0), 0) / totalCalls;
    const successCount = data.filter(
      (row) => row.status_code && row.status_code >= 200 && row.status_code < 300
    ).length;
    const successRate = (successCount / totalCalls) * 100;

    return {
      data: {
        totalCalls,
        totalTokens,
        totalCost: parseFloat(totalCost.toFixed(4)),
        avgResponseTime: Math.round(avgResponseTime),
        successRate: parseFloat(successRate.toFixed(2)),
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error in getEndpointUsageStats:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
