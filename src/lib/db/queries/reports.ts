/**
 * Reports 테이블 쿼리 함수
 */

import { createAdminClient } from '@/lib/db/server';

export interface Report {
  id: string;
  type: 'daily_trend' | 'creator_match' | 'content_idea';
  title: string;
  content: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
}

export interface CreateReportInput {
  type: 'daily_trend' | 'creator_match' | 'content_idea';
  title: string;
  content: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_by?: string;
}

export interface ReportFilters {
  type?: 'daily_trend' | 'creator_match' | 'content_idea';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  userId?: string;
}

export interface DBResponse<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

/**
 * 리포트 생성
 */
export async function createReport(input: CreateReportInput): Promise<DBResponse<Report>> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('reports')
      .insert({
        type: input.type,
        title: input.title,
        content: input.content,
        metadata: input.metadata || null,
        created_by: input.created_by || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[createReport] Database error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('[createReport] Error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 리포트 목록 조회
 */
export async function getReports(filters: ReportFilters = {}): Promise<DBResponse<Report[]>> {
  try {
    const supabase = createAdminClient();

    let query = supabase
      .from('reports')
      .select('*', { count: 'exact' });

    // 필터링
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // 사용자별 필터링
    if (filters.userId) {
      query = query.eq('created_by', filters.userId);
    }

    // 정렬
    query = query.order('created_at', { ascending: false });

    // 페이지네이션
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[getReports] Database error:', error);
      return { data: null, error: new Error(error.message), count: 0 };
    }

    return { data: data || [], error: null, count: count || 0 };
  } catch (error) {
    console.error('[getReports] Error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
      count: 0,
    };
  }
}

/**
 * 리포트 단건 조회
 */
export async function getReportById(id: string): Promise<DBResponse<Report>> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[getReportById] Database error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('[getReportById] Error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 리포트 삭제 (본인이 작성한 리포트만 삭제 가능)
 */
export async function deleteReport(id: string, userId?: string): Promise<DBResponse<null>> {
  try {
    const supabase = createAdminClient();

    // 먼저 리포트 조회하여 소유권 확인
    if (userId) {
      const { data: report, error: fetchError } = await supabase
        .from('reports')
        .select('created_by')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('[deleteReport] Fetch error:', fetchError);
        return { data: null, error: new Error(fetchError.message) };
      }

      // 본인이 작성한 리포트가 아니면 삭제 불가
      if (report.created_by !== userId) {
        return { data: null, error: new Error('본인이 작성한 리포트만 삭제할 수 있습니다.') };
      }
    }

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deleteReport] Database error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('[deleteReport] Error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
