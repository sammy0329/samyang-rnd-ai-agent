/**
 * 데일리 트렌드 리포트 생성
 */

import { getTrends } from '@/lib/db/queries/trends';

export interface DailyTrendReportData {
  date: string;
  totalTrends: number;
  topTrends: Array<{
    keyword: string;
    platform: string;
    country: string;
    viralScore: number;
    samyangRelevance: number;
    formatType?: string;
    hookPattern?: string;
  }>;
  summary: {
    averageViralScore: number;
    averageSamyangRelevance: number;
    topPlatform: string;
    topCountry: string;
  };
  recommendations: string[];
}

/**
 * 데일리 트렌드 리포트 생성
 */
export async function generateDailyTrendReport(): Promise<DailyTrendReportData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 오늘 수집된 트렌드 조회
  const trendsResult = await getTrends({
    sortBy: 'viral_score',
    sortOrder: 'desc',
    limit: 100,
  });

  if (!trendsResult.data) {
    throw new Error('Failed to fetch trends');
  }

  const allTrends = trendsResult.data;

  // 오늘 날짜 필터링 (collected_at 기준)
  const todayTrends = allTrends.filter((trend) => {
    const collectedDate = new Date(trend.collected_at);
    return collectedDate >= today && collectedDate < tomorrow;
  });

  // Top 5 선정 (바이럴 점수 + 삼양 연관성 합산)
  const topTrends = todayTrends
    .sort((a, b) => {
      const scoreA = (a.viral_score || 0) + (a.samyang_relevance || 0);
      const scoreB = (b.viral_score || 0) + (b.samyang_relevance || 0);
      return scoreB - scoreA;
    })
    .slice(0, 5)
    .map((trend) => ({
      keyword: trend.keyword,
      platform: trend.platform,
      country: trend.country,
      viralScore: trend.viral_score || 0,
      samyangRelevance: trend.samyang_relevance || 0,
      formatType: trend.format_type || undefined,
      hookPattern: trend.hook_pattern || undefined,
    }));

  // 통계 계산
  const avgViralScore = todayTrends.length > 0
    ? todayTrends.reduce((sum, t) => sum + (t.viral_score || 0), 0) / todayTrends.length
    : 0;

  const avgSamyangRelevance = todayTrends.length > 0
    ? todayTrends.reduce((sum, t) => sum + (t.samyang_relevance || 0), 0) / todayTrends.length
    : 0;

  // 가장 많이 나온 플랫폼
  const platformCounts = todayTrends.reduce((acc, t) => {
    acc[t.platform] = (acc[t.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPlatform = Object.entries(platformCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'youtube';

  // 가장 많이 나온 국가
  const countryCounts = todayTrends.reduce((acc, t) => {
    acc[t.country] = (acc[t.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCountry = Object.entries(countryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'KR';

  // 추천사항 생성
  const recommendations: string[] = [];

  if (topTrends.length > 0) {
    const topTrend = topTrends[0];
    recommendations.push(`"${topTrend.keyword}" 키워드를 활용한 콘텐츠 제작을 추천합니다.`);

    if (topPlatform) {
      recommendations.push(`${topPlatform.toUpperCase()} 플랫폼에 집중하는 것이 효과적입니다.`);
    }

    if (avgSamyangRelevance > 70) {
      recommendations.push('삼양 제품과의 연관성이 높은 트렌드가 많아 협업 기회가 풍부합니다.');
    }
  } else {
    recommendations.push('오늘 수집된 트렌드가 없습니다. 트렌드 분석을 실행해주세요.');
  }

  return {
    date: today.toISOString().split('T')[0],
    totalTrends: todayTrends.length,
    topTrends,
    summary: {
      averageViralScore: Math.round(avgViralScore),
      averageSamyangRelevance: Math.round(avgSamyangRelevance),
      topPlatform,
      topCountry,
    },
    recommendations,
  };
}
