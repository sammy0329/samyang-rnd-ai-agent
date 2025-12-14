/**
 * 리포트 API 엔드포인트
 *
 * POST /api/reports - 리포트 생성
 * GET /api/reports - 리포트 목록 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createReport, getReports } from '@/lib/db/queries/reports';
import { generateDailyTrendReport } from '@/lib/reports/daily-trend-report';
import { generateCreatorMatchReport } from '@/lib/reports/creator-match-report';
import { generateContentIdeaReport } from '@/lib/reports/content-idea-report';
import { getServerSession } from '@/lib/auth/server';

// POST 요청 스키마
const CreateReportSchema = z.object({
  type: z.enum(['daily_trend', 'creator_match', 'content_idea']),
});

// GET 요청 스키마
const GetReportsSchema = z.object({
  type: z.enum(['daily_trend', 'creator_match', 'content_idea']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
  showAll: z.string().optional().transform((val) => val === 'true').default('false'),
});

/**
 * POST /api/reports
 * 리포트 생성
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 바디 파싱
    const body = await request.json();
    const validationResult = CreateReportSchema.safeParse(body);

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

    const { type } = validationResult.data;

    // 사용자 세션 확인
    const session = await getServerSession();
    const userId = session?.data?.id || null;

    // 리포트 생성 로직 실행
    let reportData: Record<string, unknown>;
    let title: string;

    switch (type) {
      case 'daily_trend':
        reportData = (await generateDailyTrendReport()) as unknown as Record<string, unknown>;
        title = `데일리 트렌드 리포트 - ${(reportData as any).date}`;
        break;

      case 'creator_match':
        reportData = (await generateCreatorMatchReport()) as unknown as Record<string, unknown>;
        title = `크리에이터 매칭 리포트 - ${(reportData as any).date}`;
        break;

      case 'content_idea':
        reportData = (await generateContentIdeaReport()) as unknown as Record<string, unknown>;
        title = `콘텐츠 아이디어 리포트 - ${(reportData as any).date}`;
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid report type',
          },
          { status: 400 }
        );
    }

    // DB에 저장
    const saveResult = await createReport({
      type,
      title,
      content: reportData,
      created_by: userId || undefined,
    });

    if (saveResult.error || !saveResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save report',
          message: saveResult.error?.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: saveResult.data,
    });
  } catch (error) {
    console.error('[Reports API] POST Error:', error);
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
 * GET /api/reports
 * 리포트 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 사용자 세션 확인
    const session = await getServerSession();
    const userId = session?.data?.id;

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      type: searchParams.get('type') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      showAll: searchParams.get('showAll') || undefined,
    };

    const validationResult = GetReportsSchema.safeParse(queryParams);

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

    const filters = validationResult.data;

    // 리포트 조회 (showAll이 false이고 userId가 있으면 본인 데이터만)
    const result = await getReports({
      ...filters,
      userId: !filters.showAll && userId ? userId : undefined,
    });

    if (result.error || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch reports',
          message: result.error?.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        reports: result.data,
        total: result.count || 0,
        filters,
      },
    });
  } catch (error) {
    console.error('[Reports API] GET Error:', error);
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
