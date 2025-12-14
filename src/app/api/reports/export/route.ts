/**
 * 리포트 내보내기 API
 *
 * POST /api/reports/export - 리포트를 JSON 파일로 다운로드
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getReportById } from '@/lib/db/queries/reports';

// 요청 스키마
const ExportReportSchema = z.object({
  reportId: z.string().uuid(),
  format: z.enum(['json']).default('json'), // 향후 'pdf' 추가 가능
});

/**
 * POST /api/reports/export
 * 리포트 내보내기
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 바디 파싱
    const body = await request.json();
    const validationResult = ExportReportSchema.safeParse(body);

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

    const { reportId, format } = validationResult.data;

    // 리포트 조회
    const result = await getReportById(reportId);

    if (result.error || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report not found',
          message: result.error?.message || 'Report does not exist',
        },
        { status: 404 }
      );
    }

    const report = result.data;

    // JSON 형식으로 내보내기
    if (format === 'json') {
      const jsonContent = JSON.stringify(
        {
          id: report.id,
          type: report.type,
          title: report.title,
          content: report.content,
          metadata: report.metadata,
          created_at: report.created_at,
        },
        null,
        2
      );

      // 파일명 생성
      const filename = `${report.type}_${report.id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.json`;

      return new NextResponse(jsonContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Unsupported format',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Reports Export API] Error:', error);
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
