/**
 * 일일 트렌드 리포트 API
 *
 * GET /api/trends/daily
 *
 * 오늘 수집된 트렌드 중 Top 5를 반환합니다.
 * - 바이럴 점수 + 삼양 연관성 점수로 정렬
 * - 1시간 캐싱 적용
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     date: string,
 *     topTrends: Trend[],
 *     summary: {
 *       totalCount: number,
 *       averageViralScore: number,
 *       averageSamyangRelevance: number,
 *       platformDistribution: Record<string, number>
 *     }
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTrends } from '@/lib/db/queries/trends';
import { Trend } from '@/types/trends';

// 1시간 캐싱 (Vercel Edge Cache)
export const revalidate = 3600; // 60 * 60 = 1 hour

/**
 * 오늘 날짜 범위 계산 (00:00:00 ~ 23:59:59)
 */
function getTodayRange() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return {
    start: startOfDay.toISOString(),
    end: endOfDay.toISOString(),
    dateString: now.toISOString().split('T')[0], // YYYY-MM-DD
  };
}

/**
 * 트렌드 점수 계산 (바이럴 + 삼양 연관성)
 */
function calculateTrendScore(trend: Trend): number {
  const viralScore = trend.viral_score || 0;
  const samyangScore = trend.samyang_relevance || 0;
  return viralScore + samyangScore;
}

/**
 * 플랫폼별 분포 계산
 */
function getPlatformDistribution(trends: Trend[]): Record<string, number> {
  const distribution: Record<string, number> = {};

  trends.forEach((trend) => {
    const platform = trend.platform;
    distribution[platform] = (distribution[platform] || 0) + 1;
  });

  return distribution;
}

/**
 * 요약 통계 계산
 */
function calculateSummary(trends: Trend[]) {
  if (trends.length === 0) {
    return {
      totalCount: 0,
      averageViralScore: 0,
      averageSamyangRelevance: 0,
      platformDistribution: {},
    };
  }

  const totalViralScore = trends.reduce((sum, t) => sum + (t.viral_score || 0), 0);
  const totalSamyangScore = trends.reduce((sum, t) => sum + (t.samyang_relevance || 0), 0);

  return {
    totalCount: trends.length,
    averageViralScore: Math.round(totalViralScore / trends.length),
    averageSamyangRelevance: Math.round(totalSamyangScore / trends.length),
    platformDistribution: getPlatformDistribution(trends),
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { dateString } = getTodayRange();

    console.log(`[Daily Trends API] Fetching trends for ${dateString}`);

    // 1. 오늘 수집된 모든 트렌드 조회
    const result = await getTrends({
      sortBy: 'collected_at',
      sortOrder: 'desc',
      limit: 100, // 최대 100개까지 조회
    });

    if (result.error) {
      console.error('[Daily Trends API] Database error:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: result.error.message,
        },
        { status: 500 }
      );
    }

    const allTrends = result.data || [];

    // 2. 오늘 날짜 필터링 (collected_at 기준)
    const todayTrends = allTrends.filter((trend) => {
      const collectedDate = new Date(trend.collected_at).toISOString().split('T')[0];
      return collectedDate === dateString;
    });

    console.log(`[Daily Trends API] Found ${todayTrends.length} trends for today`);

    // 3. 점수 기준으로 정렬 및 Top 5 선정
    const sortedTrends = [...todayTrends].sort((a, b) => {
      return calculateTrendScore(b) - calculateTrendScore(a);
    });

    const topTrends = sortedTrends.slice(0, 5);

    // 4. 요약 통계 계산
    const summary = calculateSummary(todayTrends);

    const duration = Date.now() - startTime;
    console.log(`[Daily Trends API] Success - Top ${topTrends.length} trends (${duration}ms)`);

    // 5. 성공 응답
    return NextResponse.json(
      {
        success: true,
        data: {
          date: dateString,
          topTrends,
          summary,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('[Daily Trends API] Unexpected error:', error);

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
