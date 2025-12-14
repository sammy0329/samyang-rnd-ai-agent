/**
 * 크리에이터 매칭 API 엔드포인트
 *
 * POST /api/creators/match
 * - 크리에이터 프로필 분석
 * - AI 매칭 분석 수행
 * - 적합도 점수 산정
 * - 결과 DB 저장
 *
 * 사용 방법:
 * POST /api/creators/match
 * Body: {
 *   username: string;
 *   platform: 'tiktok' | 'instagram' | 'youtube';
 *   followerCount?: number;
 *   avgViews?: number;
 *   engagementRate?: number;
 *   contentCategory?: string;
 *   toneManner?: string;
 *   profileUrl: string;
 *   campaignPurpose?: string;
 *   targetProduct?: 'buldak' | 'samyang_ramen' | 'jelly';
 *   targetCountry?: 'KR' | 'US' | 'JP';
 *   additionalContext?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { matchCreator } from '@/lib/ai/agents/creator-matcher';
import { createCreator, updateCreator, getCreators } from '@/lib/db/queries/creators';
import { createAPIUsage } from '@/lib/db/queries/api-usage';
import { rateLimitByIP } from '@/lib/rate-limit';

// 요청 바디 검증 스키마
const MatchCreatorRequestSchema = z.object({
  // 필수 필드
  username: z.string().min(1, 'Username is required').max(100, 'Username must be less than 100 characters'),
  platform: z.enum(['tiktok', 'instagram', 'youtube'], {
    message: 'Platform must be tiktok, instagram, or youtube',
  }),
  profileUrl: z.string().url('Profile URL must be a valid URL'),

  // 크리에이터 통계 (선택)
  followerCount: z.number().min(0).optional(),
  avgViews: z.number().min(0).optional(),
  engagementRate: z.number().min(0).max(100).optional(),
  contentCategory: z.string().max(200).optional(),
  toneManner: z.string().max(500).optional(),

  // 캠페인 정보 (선택)
  campaignPurpose: z.string().max(500).optional(),
  targetProduct: z.enum(['buldak', 'samyang_ramen', 'jelly']).optional(),
  targetCountry: z.enum(['KR', 'US', 'JP']).optional().default('KR'),

  // 추가 컨텍스트
  additionalContext: z.string().optional(),
});

type MatchCreatorRequest = z.infer<typeof MatchCreatorRequestSchema>;

/**
 * POST /api/creators/match
 * 크리에이터 매칭 분석 수행
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 0. Rate Limiting (IP 기반, 5분에 20회)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await rateLimitByIP(ip, {
      max: 20, // 최대 20회
      window: 300, // 5분 (300초)
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)} seconds.`,
          retryAfter: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 1. 요청 바디 파싱 및 검증
    const body = await request.json();
    const validationResult = MatchCreatorRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      username,
      platform,
      profileUrl,
      followerCount,
      avgViews,
      engagementRate,
      contentCategory,
      toneManner,
      campaignPurpose,
      targetProduct,
      targetCountry,
      additionalContext,
    } = validationResult.data;

    console.log(`[Creator Match API] Starting analysis for: ${username} on ${platform}`);

    // 2. AI 매칭 분석 수행
    console.log(`[Creator Match API] Analyzing creator with AI...`);

    const matchingInput = {
      username,
      platform,
      followerCount,
      avgViews,
      engagementRate,
      contentCategory,
      toneManner,
      campaignPurpose,
      targetProduct,
      targetCountry,
      additionalContext,
    };

    const matchingResult = await matchCreator(matchingInput);

    if (matchingResult.error || !matchingResult.data) {
      console.error('[Creator Match API] AI matching error:', matchingResult.error);
      return NextResponse.json(
        {
          success: false,
          error: 'AI matching failed',
          message: matchingResult.error?.message || 'Failed to analyze creator',
        },
        { status: 500 }
      );
    }

    const matching = matchingResult.data;
    console.log(`[Creator Match API] Matching complete. Total score: ${matching.total_fit_score}`);

    // 3. DB에 저장 또는 업데이트
    console.log(`[Creator Match API] Saving to database...`);

    // 기존 크리에이터 확인
    const existingCreatorsResult = await getCreators({
      username,
      platform,
      limit: 1,
    });

    let savedCreator;

    if (existingCreatorsResult.data && existingCreatorsResult.data.length > 0) {
      // 업데이트
      const existingCreator = existingCreatorsResult.data[0];
      console.log(`[Creator Match API] Updating existing creator: ${existingCreator.id}`);

      const updateResult = await updateCreator(existingCreator.id, {
        follower_count: followerCount,
        avg_views: avgViews,
        engagement_rate: engagementRate,
        content_category: contentCategory,
        tone_manner: toneManner,
        brand_fit_score: matching.total_fit_score,
        collaboration_history: matching.collaboration_strategy,
        risk_factors: matching.risk_assessment,
        analysis_data: {
          quantitative_scores: matching.quantitative_scores,
          qualitative_scores: matching.qualitative_scores,
          strengths: matching.strengths,
          weaknesses: matching.weaknesses,
          audience_analysis: matching.audience_analysis,
          content_style_analysis: matching.content_style_analysis,
          recommended_products: matching.recommended_products,
        },
        last_analyzed_at: new Date().toISOString(),
      });

      if (updateResult.error || !updateResult.data) {
        console.error('[Creator Match API] Database update error:', updateResult.error);
        return NextResponse.json(
          {
            success: false,
            error: 'Database error',
            message: updateResult.error?.message || 'Failed to update creator',
          },
          { status: 500 }
        );
      }

      savedCreator = updateResult.data;
    } else {
      // 새로 생성
      console.log(`[Creator Match API] Creating new creator`);

      const createResult = await createCreator({
        username,
        platform,
        profile_url: profileUrl,
        follower_count: followerCount,
        avg_views: avgViews,
        engagement_rate: engagementRate,
        content_category: contentCategory,
        tone_manner: toneManner,
        brand_fit_score: matching.total_fit_score,
        collaboration_history: matching.collaboration_strategy,
        risk_factors: matching.risk_assessment,
        analysis_data: {
          quantitative_scores: matching.quantitative_scores,
          qualitative_scores: matching.qualitative_scores,
          strengths: matching.strengths,
          weaknesses: matching.weaknesses,
          audience_analysis: matching.audience_analysis,
          content_style_analysis: matching.content_style_analysis,
          recommended_products: matching.recommended_products,
        },
      });

      if (createResult.error || !createResult.data) {
        console.error('[Creator Match API] Database create error:', createResult.error);
        return NextResponse.json(
          {
            success: false,
            error: 'Database error',
            message: createResult.error?.message || 'Failed to save creator',
          },
          { status: 500 }
        );
      }

      savedCreator = createResult.data;
    }

    console.log(`[Creator Match API] Saved to DB with ID: ${savedCreator.id}`);

    // 4. API 사용량 기록
    const duration = Date.now() - startTime;
    try {
      await createAPIUsage({
        endpoint: '/api/creators/match',
        method: 'POST',
        status_code: 200,
        response_time_ms: duration,
      });
    } catch (error) {
      // API 사용량 기록 실패는 무시 (메인 플로우에 영향 없음)
      console.warn('[Creator Match API] Failed to track API usage:', error);
    }

    // 5. 성공 응답
    return NextResponse.json(
      {
        success: true,
        data: {
          creator: savedCreator,
          matching: {
            total_fit_score: matching.total_fit_score,
            quantitative_scores: matching.quantitative_scores,
            qualitative_scores: matching.qualitative_scores,
            strengths: matching.strengths,
            weaknesses: matching.weaknesses,
            audience_analysis: matching.audience_analysis,
            content_style_analysis: matching.content_style_analysis,
            collaboration_strategy: matching.collaboration_strategy,
            risk_assessment: matching.risk_assessment,
            recommended_products: matching.recommended_products,
          },
        },
        meta: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      }
    );
  } catch (error) {
    console.error('[Creator Match API] Unexpected error:', error);

    // API 사용량 기록 (에러 케이스)
    const duration = Date.now() - startTime;
    try {
      await createAPIUsage({
        endpoint: '/api/creators/match',
        method: 'POST',
        status_code: 500,
        response_time_ms: duration,
      });
    } catch (trackError) {
      console.warn('[Creator Match API] Failed to track API usage:', trackError);
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
