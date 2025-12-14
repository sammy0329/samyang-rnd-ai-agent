/**
 * 크리에이터 목록 조회 API 엔드포인트
 *
 * GET /api/creators
 * - 크리에이터 목록 조회
 * - 필터링 (플랫폼, 적합도 점수, 팔로워 수, 참여율)
 * - 정렬 (점수순, 최신순, 팔로워순)
 * - 페이지네이션
 *
 * 쿼리 파라미터:
 * - username?: string (부분 매칭)
 * - platform?: 'tiktok' | 'instagram' | 'youtube'
 * - content_category?: string (부분 매칭)
 * - minFollowerCount?: number
 * - minEngagementRate?: number (0-100)
 * - minBrandFitScore?: number (0-100)
 * - sortBy?: 'follower_count' | 'engagement_rate' | 'brand_fit_score' | 'last_analyzed_at' | 'created_at'
 * - sortOrder?: 'asc' | 'desc'
 * - limit?: number (기본: 20, 최대: 100)
 * - offset?: number (기본: 0)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCreators } from '@/lib/db/queries/creators';
import { createAPIUsage } from '@/lib/db/queries/api-usage';
import { getServerSession } from '@/lib/auth/server';
import { createAdminClient } from '@/lib/db/server';
import type { CreatorFilters } from '@/types/creators';

/**
 * GET /api/creators
 * 크리에이터 목록 조회
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. 사용자 세션 가져오기
    const session = await getServerSession();
    const userId = session?.data?.id;

    // 2. 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;

    const filters: CreatorFilters = {};

    // showAll 파라미터 (기본값: false)
    const showAll = searchParams.get('showAll') === 'true';

    // 텍스트 필터
    const username = searchParams.get('username');
    if (username) filters.username = username;

    const platform = searchParams.get('platform');
    if (platform && ['tiktok', 'instagram', 'youtube'].includes(platform)) {
      filters.platform = platform as 'tiktok' | 'instagram' | 'youtube';
    }

    const contentCategory = searchParams.get('content_category');
    if (contentCategory) filters.content_category = contentCategory;

    // 숫자 필터
    const minFollowerCount = searchParams.get('minFollowerCount');
    if (minFollowerCount) {
      const parsed = parseInt(minFollowerCount, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        filters.minFollowerCount = parsed;
      }
    }

    const minEngagementRate = searchParams.get('minEngagementRate');
    if (minEngagementRate) {
      const parsed = parseFloat(minEngagementRate);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        filters.minEngagementRate = parsed;
      }
    }

    const minBrandFitScore = searchParams.get('minBrandFitScore');
    if (minBrandFitScore) {
      const parsed = parseFloat(minBrandFitScore);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        filters.minBrandFitScore = parsed;
      }
    }

    // 정렬
    const sortBy = searchParams.get('sortBy');
    if (sortBy && ['follower_count', 'engagement_rate', 'brand_fit_score', 'last_analyzed_at', 'created_at'].includes(sortBy)) {
      filters.sortBy = sortBy as CreatorFilters['sortBy'];
    }

    const sortOrder = searchParams.get('sortOrder');
    if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
      filters.sortOrder = sortOrder as 'asc' | 'desc';
    }

    // 페이지네이션
    const limit = searchParams.get('limit');
    if (limit) {
      const parsed = parseInt(limit, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
        filters.limit = parsed;
      }
    }

    const offset = searchParams.get('offset');
    if (offset) {
      const parsed = parseInt(offset, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        filters.offset = parsed;
      }
    }

    // 사용자별 필터링 (showAll이 false이고 userId가 있으면 필터링)
    if (!showAll && userId) {
      filters.userId = userId;
    }

    console.log('[Creators API] Fetching creators with filters:', filters);

    // 3. DB 조회
    const result = await getCreators(filters);

    if (result.error) {
      console.error('[Creators API] Database error:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: result.error.message,
        },
        { status: 500 }
      );
    }

    const creators = result.data || [];
    const total = result.count || 0;

    console.log(`[Creators API] Found ${creators.length} creators (total: ${total})`);

    // 4. API 사용량 기록
    const duration = Date.now() - startTime;
    try {
      await createAPIUsage({
        endpoint: '/api/creators',
        method: 'GET',
        status_code: 200,
        response_time_ms: duration,
      });
    } catch (error) {
      console.warn('[Creators API] Failed to track API usage:', error);
    }

    // 5. 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        creators,
        total,
        filters: {
          ...filters,
          limit: filters.limit || 20,
          offset: filters.offset || 0,
        },
      },
      meta: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Creators API] Unexpected error:', error);

    // API 사용량 기록 (에러 케이스)
    const duration = Date.now() - startTime;
    try {
      await createAPIUsage({
        endpoint: '/api/creators',
        method: 'GET',
        status_code: 500,
        response_time_ms: duration,
      });
    } catch (trackError) {
      console.warn('[Creators API] Failed to track API usage:', trackError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/creators
 * 크리에이터 삭제 (본인이 작성한 크리에이터만)
 */
export async function DELETE(request: NextRequest) {
  try {
    // 사용자 세션 확인
    const session = await getServerSession();
    const userId = session?.data?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: '로그인이 필요합니다.',
        },
        { status: 401 }
      );
    }

    // 쿼리 파라미터에서 크리에이터 ID 가져오기
    const searchParams = request.nextUrl.searchParams;
    const creatorId = searchParams.get('id');

    if (!creatorId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: '크리에이터 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // Admin client로 크리에이터 조회 (소유권 확인)
    const adminClient = createAdminClient();

    const { data: creator, error: fetchError } = await adminClient
      .from('creators')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (fetchError || !creator) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: '크리에이터를 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 소유권 확인
    if (creator.created_by !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: '본인이 작성한 크리에이터만 삭제할 수 있습니다.',
        },
        { status: 403 }
      );
    }

    // 크리에이터 삭제
    const { error: deleteError } = await adminClient
      .from('creators')
      .delete()
      .eq('id', creatorId);

    if (deleteError) {
      console.error('[Creators DELETE API] Delete error:', deleteError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete creator',
          message: deleteError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '크리에이터가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('[Creators DELETE API] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
