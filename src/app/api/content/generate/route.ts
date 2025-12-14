/**
 * 콘텐츠 아이디어 생성 API 엔드포인트
 *
 * POST /api/content/generate
 * - AI를 사용해 숏폼 콘텐츠 아이디어 생성
 * - 3개의 다양한 아이디어를 동시에 생성
 * - 결과를 DB에 저장
 *
 * 사용 방법:
 * POST /api/content/generate
 * Body: {
 *   brandCategory: 'buldak' | 'samyang_ramen' | 'jelly';
 *   tone: 'fun' | 'kawaii' | 'provocative' | 'cool';
 *   targetCountry: 'KR' | 'US' | 'JP';
 *
 *   // 옵션 1: 트렌드 컨텍스트 전체 데이터 전달 (권장)
 *   trendContext?: {
 *     id: string;
 *     keyword: string;
 *     platform: string;
 *     country?: string;
 *     format_type?: string;
 *     hook_pattern?: string | null;
 *     visual_pattern?: string | null;
 *     music_pattern?: string | null;
 *     viral_score?: number | null;
 *     samyang_relevance?: number | null;
 *     analysis_data?: Record<string, unknown> | null;
 *   };
 *
 *   // 옵션 2: 하위 호환성 (기존 방식)
 *   trendId?: string;
 *   trendKeyword?: string;
 *   trendDescription?: string;
 *
 *   preferredPlatform?: 'tiktok' | 'instagram' | 'youtube';
 *   additionalRequirements?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateContentVariations } from '@/lib/ai/agents/content-generator';
import { createContentIdea } from '@/lib/db/queries/content';
import { createAPIUsage } from '@/lib/db/queries/api-usage';
import { rateLimitByIP } from '@/lib/rate-limit';
import { getServerSession } from '@/lib/auth/server';

// 트렌드 컨텍스트 스키마
const TrendContextSchema = z.object({
  id: z.string(),
  keyword: z.string(),
  platform: z.string(),
  country: z.string().optional(),
  format_type: z.string().optional(),
  hook_pattern: z.string().nullable().optional(),
  visual_pattern: z.string().nullable().optional(),
  music_pattern: z.string().nullable().optional(),
  viral_score: z.number().nullable().optional(),
  samyang_relevance: z.number().nullable().optional(),
  analysis_data: z.record(z.string(), z.unknown()).nullable().optional(),
});

// 요청 바디 검증 스키마
const GenerateContentRequestSchema = z.object({
  brandCategory: z.enum(['buldak', 'samyang_ramen', 'jelly'], {
    message: 'Brand category must be buldak, samyang_ramen, or jelly',
  }),
  tone: z.enum(['fun', 'kawaii', 'provocative', 'cool'], {
    message: 'Tone must be fun, kawaii, provocative, or cool',
  }),
  targetCountry: z.enum(['KR', 'US', 'JP'], {
    message: 'Target country must be KR, US, or JP',
  }),
  // 트렌드 컨텍스트 (전체 트렌드 분석 데이터)
  trendContext: TrendContextSchema.optional(),
  // 하위 호환성을 위해 유지
  trendId: z.string().uuid().optional(),
  trendKeyword: z.string().max(100).optional(),
  trendDescription: z.string().max(1000).optional(),
  preferredPlatform: z.enum(['tiktok', 'instagram', 'youtube']).optional(),
  additionalRequirements: z.string().max(1000).optional(),
});

type GenerateContentRequest = z.infer<typeof GenerateContentRequestSchema>;

/**
 * POST /api/content/generate
 * 콘텐츠 아이디어 생성
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 0. Rate Limiting (IP 기반, 5분에 5회)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await rateLimitByIP(ip, {
      max: 5, // 최대 5회 (생성 비용이 높으므로 제한적)
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
    const validationResult = GenerateContentRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const requestData: GenerateContentRequest = validationResult.data;

    // 2. 사용자 세션 확인 (로그인된 사용자만 사용 가능)
    const { data: session } = await getServerSession();
    const userId = session?.id || null;

    // 3. AI 콘텐츠 아이디어 생성 (3개의 다양한 버전)
    console.log('[Content Generation API] Generating content ideas...');
    const generationResult = await generateContentVariations(
      {
        brandCategory: requestData.brandCategory,
        tone: requestData.tone,
        targetCountry: requestData.targetCountry,
        // 트렌드 컨텍스트가 있으면 전체 데이터 전달
        trendContext: requestData.trendContext,
        // 하위 호환성을 위해 유지
        trendKeyword: requestData.trendKeyword,
        trendDescription: requestData.trendDescription,
        preferredPlatform: requestData.preferredPlatform,
        additionalRequirements: requestData.additionalRequirements,
      },
      3 // 3개 생성
    );

    // 4. 생성 실패 처리
    if (generationResult.successCount === 0) {
      console.error('[Content Generation API] All variations failed');
      return NextResponse.json(
        {
          success: false,
          error: 'Content generation failed',
          message: 'Failed to generate any content ideas. Please try again.',
        },
        { status: 500 }
      );
    }

    // 5. 성공한 아이디어들을 DB에 저장
    const savedIdeas = [];
    for (const variation of generationResult.variations) {
      if (variation.data) {
        const contentData = variation.data;

        const saveResult = await createContentIdea({
          // 트렌드 컨텍스트가 있으면 해당 ID 사용, 아니면 기존 trendId 사용
          trend_id: requestData.trendContext?.id || requestData.trendId,
          title: contentData.title,
          brand_category: contentData.brand_category,
          tone: contentData.tone,
          format_type: contentData.format_type,
          platform: contentData.platform,
          hook_text: contentData.hook_text,
          hook_visual: contentData.hook_visual,
          scene_structure: contentData.scene_structure as unknown as Record<string, unknown>,
          editing_format: contentData.editing_format,
          music_style: contentData.music_style,
          props_needed: contentData.props_needed,
          hashtags: contentData.hashtags,
          target_country: contentData.target_country,
          expected_performance: contentData.expected_performance as unknown as Record<string, unknown>,
          production_tips: contentData.production_tips,
          common_mistakes: contentData.common_mistakes,
          created_by: userId || undefined,
        });

        if (saveResult.data) {
          savedIdeas.push(saveResult.data);
        } else {
          console.error('[Content Generation API] Failed to save idea:', saveResult.error);
        }
      }
    }

    // 6. API 사용량 기록
    const duration = Date.now() - startTime;
    try {
      await createAPIUsage({
        endpoint: '/api/content/generate',
        method: 'POST',
        status_code: 200,
        response_time_ms: duration,
      });
    } catch (error) {
      console.warn('[Content Generation API] Failed to track API usage:', error);
    }

    // 7. 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        ideas: savedIdeas,
        generatedCount: savedIdeas.length,
        successRate: generationResult.successCount,
      },
      message: `Successfully generated ${savedIdeas.length} content idea(s)`,
    });
  } catch (error) {
    console.error('[Content Generation API] Error:', error);

    const duration = Date.now() - startTime;

    // API 사용량 기록 (에러)
    try {
      await createAPIUsage({
        endpoint: '/api/content/generate',
        method: 'POST',
        status_code: 500,
        response_time_ms: duration,
      });
    } catch (usageError) {
      console.warn('[Content Generation API] Failed to track API usage:', usageError);
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
