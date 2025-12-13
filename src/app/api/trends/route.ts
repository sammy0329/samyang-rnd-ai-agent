/**
 * 트렌드 목록 조회 API
 *
 * GET /api/trends
 *
 * Query Parameters:
 * - keyword?: string - 키워드 필터링
 * - platform?: 'tiktok' | 'reels' | 'shorts' - 플랫폼 필터링
 * - country?: 'KR' | 'US' | 'JP' - 국가 필터링
 * - minViralScore?: number (0-100) - 최소 바이럴 점수
 * - minSamyangRelevance?: number (0-100) - 최소 삼양 연관성 점수
 * - sortBy?: 'collected_at' | 'viral_score' | 'samyang_relevance' | 'created_at' - 정렬 기준
 * - sortOrder?: 'asc' | 'desc' - 정렬 순서
 * - limit?: number (1-100) - 페이지당 개수
 * - offset?: number - 페이지 오프셋
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     trends: Trend[],
 *     total: number,
 *     limit: number,
 *     offset: number
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTrends } from '@/lib/db/queries/trends';
import { Platform, Country } from '@/types/trends';

// 쿼리 파라미터 검증 스키마
const TrendListQuerySchema = z.object({
  keyword: z.string().optional(),
  platform: z.enum(['tiktok', 'reels', 'shorts']).optional(),
  country: z.enum(['KR', 'US', 'JP']).optional(),
  minViralScore: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const num = parseInt(val, 10);
      if (isNaN(num)) return undefined;
      return num;
    })
    .refine((val) => val === undefined || (val >= 0 && val <= 100), {
      message: 'minViralScore must be between 0 and 100',
    }),
  minSamyangRelevance: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const num = parseInt(val, 10);
      if (isNaN(num)) return undefined;
      return num;
    })
    .refine((val) => val === undefined || (val >= 0 && val <= 100), {
      message: 'minSamyangRelevance must be between 0 and 100',
    }),
  sortBy: z
    .enum(['collected_at', 'viral_score', 'samyang_relevance', 'created_at'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 50; // 기본값
      const num = parseInt(val, 10);
      if (isNaN(num)) return 50;
      return num;
    })
    .refine((val) => val >= 1 && val <= 100, {
      message: 'limit must be between 1 and 100',
    }),
  offset: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 0; // 기본값
      const num = parseInt(val, 10);
      if (isNaN(num)) return 0;
      return num;
    })
    .refine((val) => val >= 0, {
      message: 'offset must be >= 0',
    }),
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const queryParams = {
      keyword: searchParams.get('keyword') || undefined,
      platform: searchParams.get('platform') || undefined,
      country: searchParams.get('country') || undefined,
      minViralScore: searchParams.get('minViralScore') || undefined,
      minSamyangRelevance: searchParams.get('minSamyangRelevance') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    };

    // 2. 쿼리 파라미터 검증
    const validationResult = TrendListQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      console.error('[Trends List API] Validation error:', validationResult.error);

      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: errors,
        },
        { status: 400 }
      );
    }

    const filters = validationResult.data;

    console.log('[Trends List API] Query params:', filters);

    // 3. DB에서 트렌드 조회
    const result = await getTrends({
      keyword: filters.keyword,
      platform: filters.platform as Platform | undefined,
      country: filters.country as Country | undefined,
      minViralScore: filters.minViralScore,
      minSamyangRelevance: filters.minSamyangRelevance,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      limit: filters.limit,
      offset: filters.offset,
    });

    if (result.error) {
      console.error('[Trends List API] Database error:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: result.error.message,
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(
      `[Trends List API] Success - Found ${result.data?.length || 0} trends (${duration}ms)`
    );

    // 4. 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        trends: result.data || [],
        total: result.count || 0,
        limit: filters.limit,
        offset: filters.offset,
      },
    });
  } catch (error) {
    console.error('[Trends List API] Unexpected error:', error);

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
