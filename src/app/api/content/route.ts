/**
 * 콘텐츠 아이디어 목록 조회 API 엔드포인트
 *
 * GET /api/content
 * - 저장된 콘텐츠 아이디어 목록 조회
 * - 필터링 및 정렬 지원
 * - 페이지네이션 지원
 *
 * Query Parameters:
 * - trend_id?: string (트렌드 ID 필터)
 * - brand_category?: 'buldak' | 'samyang_ramen' | 'jelly'
 * - tone?: 'fun' | 'kawaii' | 'provocative' | 'cool'
 * - target_country?: 'KR' | 'US' | 'JP'
 * - sortBy?: 'generated_at' | 'created_at' | 'title'
 * - sortOrder?: 'asc' | 'desc'
 * - limit?: number (기본: 20, 최대: 100)
 * - offset?: number (기본: 0)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getContentIdeas } from '@/lib/db/queries/content';
import { createAPIUsage } from '@/lib/db/queries/api-usage';
import { getServerSession } from '@/lib/auth/server';
import type { ContentIdeaFilters } from '@/types/content';

/**
 * GET /api/content
 * 콘텐츠 아이디어 목록 조회
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Query Parameters 파싱
    const searchParams = request.nextUrl.searchParams;

    // 2. 필터 구성
    const filters: ContentIdeaFilters = {
      trend_id: searchParams.get('trend_id') || undefined,
      brand_category: (searchParams.get('brand_category') as 'buldak' | 'samyang_ramen' | 'jelly') || undefined,
      tone: (searchParams.get('tone') as 'fun' | 'kawaii' | 'provocative' | 'cool') || undefined,
      target_country: (searchParams.get('target_country') as 'KR' | 'US' | 'JP') || undefined,
      sortBy: (searchParams.get('sortBy') as 'generated_at' | 'created_at' | 'title') || 'generated_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      limit: Math.min(Number(searchParams.get('limit')) || 20, 100), // 최대 100개
      offset: Number(searchParams.get('offset')) || 0,
    };

    // 3. 사용자 세션 확인 (옵션: 로그인 안 해도 목록 조회 가능하지만 필터 추가 가능)
    const { data: session } = await getServerSession();
    const userId = session?.id || null;

    // 내 아이디어만 보기 옵션
    if (searchParams.get('myIdeas') === 'true' && userId) {
      filters.created_by = userId;
    }

    // 4. 콘텐츠 아이디어 조회
    const result = await getContentIdeas(filters);

    if (result.error) {
      console.error('[Content List API] Database error:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: result.error.message,
        },
        { status: 500 }
      );
    }

    // 5. API 사용량 기록
    const duration = Date.now() - startTime;

    try {
      await createAPIUsage({
        endpoint: '/api/content',
        method: 'GET',
        status_code: 200,
        response_time_ms: duration,
      });
    } catch (error) {
      console.warn('[Content List API] Failed to track API usage:', error);
    }

    // 6. 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        ideas: result.data,
        total: result.count || 0,
        filters,
      },
    });
  } catch (error) {
    console.error('[Content List API] Error:', error);

    const duration = Date.now() - startTime;

    // API 사용량 기록 (에러)
    try {
      await createAPIUsage({
        endpoint: '/api/content',
        method: 'GET',
        status_code: 500,
        response_time_ms: duration,
      });
    } catch (usageError) {
      console.warn('[Content List API] Failed to track API usage:', usageError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
