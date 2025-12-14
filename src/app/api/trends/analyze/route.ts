/**
 * 트렌드 분석 API 엔드포인트
 *
 * POST /api/trends/analyze
 * - 트렌드 데이터 수집
 * - AI 분석 수행
 * - 결과 DB 저장
 *
 * 사용 방법:
 * POST /api/trends/analyze
 * Body: {
 *   keyword: string;
 *   platform: 'youtube' | 'tiktok' | 'instagram';
 *   country?: 'KR' | 'US' | 'JP';
 *   additionalContext?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { collectTrends } from '@/lib/api/trend-collector';
import { analyzeTrend } from '@/lib/ai/agents/trend-analyzer';
import { createTrend } from '@/lib/db/queries/trends';
import { createAPIUsage } from '@/lib/db/queries/api-usage';
import { rateLimitByIP } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// 요청 바디 검증 스키마
const AnalyzeTrendRequestSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required').max(100, 'Keyword must be less than 100 characters'),
  platform: z.enum(['youtube', 'tiktok', 'instagram'], {
    message: 'Platform must be youtube, tiktok, or instagram',
  }),
  country: z.enum(['KR', 'US', 'JP']).optional().default('KR'),
  additionalContext: z.string().optional(),
});

type AnalyzeTrendRequest = z.infer<typeof AnalyzeTrendRequestSchema>;

/**
 * POST /api/trends/analyze
 * 트렌드 분석 수행
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 0. Rate Limiting (IP 기반, 5분에 10회)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await rateLimitByIP(ip, {
      max: 10, // 최대 10회
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
    const validationResult = AnalyzeTrendRequestSchema.safeParse(body);

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

    const { keyword, platform, country, additionalContext } = validationResult.data;

    logger.apiRequest('POST', '/api/trends/analyze', { keyword, platform, country });

    // 2. 트렌드 데이터 수집
    let collectionResult;

    if (platform === 'youtube') {
      collectionResult = await collectTrends({
        keyword,
        maxResults: 10,
        platforms: ['YouTube'],
        country,
      });

      logger.info('Trend data collected', {
        platform: 'YouTube',
        country,
        totalVideos: collectionResult.totalVideos
      });
    } else {
      // TikTok/Instagram은 현재 제한적 지원
      logger.warn(`Platform ${platform} has limited collection support`);
      collectionResult = await collectTrends({
        keyword,
        maxResults: 10,
        platforms: platform === 'tiktok' ? ['TikTok'] : ['Instagram'],
        country,
      });

      logger.info('Trend data collected', {
        platform,
        country,
        totalVideos: collectionResult.totalVideos
      });
    }

    // 수집된 데이터가 없으면 에러
    if (collectionResult.totalVideos === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No trend data found',
          message: `No videos found for keyword "${keyword}" on ${platform}`,
          hint: platform !== 'youtube'
            ? 'TikTok and Instagram have limited data availability. Try using YouTube instead.'
            : 'Try a different keyword or check if the YouTube API quota is exceeded.',
        },
        { status: 404 }
      );
    }

    // 3. AI 분석 수행
    const endTimer = logger.startTimer('AI trend analysis');

    const analysisInput = {
      keyword,
      platform,
      country,
      additionalContext: additionalContext || `Collected ${collectionResult.totalVideos} videos. Top video: ${collectionResult.videos[0]?.title || 'N/A'}`,
    };

    const analysisResult = await analyzeTrend(analysisInput);
    endTimer();

    if (analysisResult.error || !analysisResult.data) {
      logger.error('AI analysis failed', analysisResult.error);
      return NextResponse.json(
        {
          success: false,
          error: 'AI analysis failed',
          message: analysisResult.error?.message || 'Failed to analyze trend',
        },
        { status: 500 }
      );
    }

    const analysis = analysisResult.data;
    logger.info('AI analysis complete', {
      viral_score: analysis.viral_score,
      samyang_relevance: analysis.samyang_relevance,
      format_type: analysis.format_type
    });

    // 4. DB에 저장

    // Platform 타입 매핑 (DB 스키마에 맞게 변환)
    const dbPlatform = platform === 'youtube' ? 'shorts' : platform === 'instagram' ? 'reels' : 'tiktok';

    const createResult = await createTrend({
      keyword,
      platform: dbPlatform as 'shorts' | 'reels' | 'tiktok',
      country,
      format_type: analysis.format_type,
      hook_pattern: analysis.hook_pattern,
      visual_pattern: analysis.visual_pattern,
      music_pattern: analysis.music_pattern,
      viral_score: analysis.viral_score,
      samyang_relevance: analysis.samyang_relevance,
      analysis_data: {
        brand_fit_reason: analysis.brand_fit_reason,
        recommended_products: analysis.recommended_products,
        target_audience: analysis.target_audience,
        estimated_reach: analysis.estimated_reach,
        key_success_factors: analysis.key_success_factors,
        risks: analysis.risks,
        collected_videos: collectionResult.videos.slice(0, 5).map(v => ({
          title: v.title,
          url: v.videoUrl,
          viewCount: v.viewCount,
        })),
      },
    });

    if (createResult.error || !createResult.data) {
      logger.error('Database save error', createResult.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: createResult.error?.message || 'Failed to save trend analysis',
        },
        { status: 500 }
      );
    }

    const savedTrend = createResult.data;
    logger.dbQuery('INSERT', 'trends', undefined, { id: savedTrend.id });

    // 5. API 사용량 기록
    const duration = Date.now() - startTime;
    try {
      await createAPIUsage({
        endpoint: '/api/trends/analyze',
        method: 'POST',
        status_code: 200,
        response_time_ms: duration,
      });
    } catch (error) {
      // API 사용량 기록 실패는 무시 (메인 플로우에 영향 없음)
      logger.warn('Failed to track API usage', { error: error instanceof Error ? error.message : String(error) });
    }

    // 6. 성공 응답
    logger.apiResponse('POST', '/api/trends/analyze', 200, duration);

    return NextResponse.json(
      {
        success: true,
        data: {
          trend: savedTrend,
          analysis: {
            viral_score: analysis.viral_score,
            samyang_relevance: analysis.samyang_relevance,
            format_type: analysis.format_type,
            brand_fit_reason: analysis.brand_fit_reason,
            recommended_products: analysis.recommended_products,
            target_audience: analysis.target_audience,
            estimated_reach: analysis.estimated_reach,
            key_success_factors: analysis.key_success_factors,
            risks: analysis.risks,
          },
          collection: {
            totalVideos: collectionResult.totalVideos,
            breakdown: collectionResult.breakdown,
            topVideos: collectionResult.videos.slice(0, 3).map(v => ({
              title: v.title,
              platform: v.platform,
              url: v.videoUrl,
              viewCount: v.viewCount,
              creatorName: v.creatorName,
            })),
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
    const duration = Date.now() - startTime;
    logger.error('Unexpected error in trend analysis', error);
    logger.apiResponse('POST', '/api/trends/analyze', 500, duration);

    // API 사용량 기록 (에러 케이스)
    try {
      await createAPIUsage({
        endpoint: '/api/trends/analyze',
        method: 'POST',
        status_code: 500,
        response_time_ms: duration,
      });
    } catch (trackError) {
      logger.warn('Failed to track API usage', { error: trackError instanceof Error ? trackError.message : String(trackError) });
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
