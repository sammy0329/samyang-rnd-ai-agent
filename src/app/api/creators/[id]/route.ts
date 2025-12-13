/**
 * 크리에이터 프로필 상세 조회 API 엔드포인트
 *
 * GET /api/creators/[id]
 * - 특정 크리에이터 상세 정보 조회
 * - 매칭 분석 결과 포함
 * - 협업 전략 및 리스크 평가 포함
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCreatorById } from '@/lib/db/queries/creators';
import { createAPIUsage } from '@/lib/db/queries/api-usage';

/**
 * GET /api/creators/[id]
 * 크리에이터 상세 정보 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();

  try {
    // 1. ID 파라미터 가져오기
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Creator ID is required',
        },
        { status: 400 }
      );
    }

    console.log(`[Creator Profile API] Fetching creator: ${id}`);

    // 2. DB 조회
    const result = await getCreatorById(id);

    if (result.error) {
      console.error('[Creator Profile API] Database error:', result.error);

      // 404 vs 500 구분
      if (result.error.message.includes('not found') || result.error.message.includes('No rows')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not found',
            message: `Creator with ID ${id} not found`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: result.error.message,
        },
        { status: 500 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: `Creator with ID ${id} not found`,
        },
        { status: 404 }
      );
    }

    const creator = result.data;

    console.log(`[Creator Profile API] Found creator: ${creator.username}`);

    // 3. API 사용량 기록
    const duration = Date.now() - startTime;
    try {
      await createAPIUsage({
        endpoint: `/api/creators/${id}`,
        method: 'GET',
        status_code: 200,
        response_time_ms: duration,
      });
    } catch (error) {
      console.warn('[Creator Profile API] Failed to track API usage:', error);
    }

    // 4. 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        creator: {
          // 기본 정보
          id: creator.id,
          username: creator.username,
          platform: creator.platform,
          profile_url: creator.profile_url,

          // 통계
          follower_count: creator.follower_count,
          avg_views: creator.avg_views,
          engagement_rate: creator.engagement_rate,

          // 콘텐츠 정보
          content_category: creator.content_category,
          tone_manner: creator.tone_manner,

          // 분석 결과
          brand_fit_score: creator.brand_fit_score,
          collaboration_history: creator.collaboration_history,
          risk_factors: creator.risk_factors,
          analysis_data: creator.analysis_data,

          // 메타 정보
          last_analyzed_at: creator.last_analyzed_at,
          created_at: creator.created_at,
          updated_at: creator.updated_at,
        },
      },
      meta: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Creator Profile API] Unexpected error:', error);

    // API 사용량 기록 (에러 케이스)
    const duration = Date.now() - startTime;
    try {
      const { id } = await params;
      await createAPIUsage({
        endpoint: `/api/creators/${id}`,
        method: 'GET',
        status_code: 500,
        response_time_ms: duration,
      });
    } catch (trackError) {
      console.warn('[Creator Profile API] Failed to track API usage:', trackError);
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
