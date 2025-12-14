/**
 * 크리에이터 매칭 리포트 생성
 */

import { getCreators } from '@/lib/db/queries/creators';

export interface CreatorMatchReportData {
  date: string;
  totalCreators: number;
  topCreators: Array<{
    username: string;
    platform: string;
    brandFitScore: number;
    followerCount: number;
    engagementRate: number;
    contentCategory?: string;
  }>;
  summary: {
    averageBrandFitScore: number;
    highFitCount: number;
    mediumFitCount: number;
    lowFitCount: number;
    topPlatform: string;
  };
  recommendations: string[];
}

/**
 * 크리에이터 매칭 리포트 생성
 */
export async function generateCreatorMatchReport(): Promise<CreatorMatchReportData> {
  const today = new Date();

  // 모든 크리에이터 조회 (적합도 순)
  const creatorsResult = await getCreators({
    sortBy: 'brand_fit_score',
    sortOrder: 'desc',
    limit: 100,
  });

  if (!creatorsResult.data) {
    throw new Error('Failed to fetch creators');
  }

  const allCreators = creatorsResult.data;

  // Top 10 선정
  const topCreators = allCreators.slice(0, 10).map((creator) => ({
    username: creator.username,
    platform: creator.platform,
    brandFitScore: creator.brand_fit_score || 0,
    followerCount: creator.follower_count || 0,
    engagementRate: creator.engagement_rate || 0,
    contentCategory: creator.content_category || undefined,
  }));

  // 통계 계산
  const avgBrandFitScore = allCreators.length > 0
    ? allCreators.reduce((sum, c) => sum + (c.brand_fit_score || 0), 0) / allCreators.length
    : 0;

  const highFitCount = allCreators.filter((c) => (c.brand_fit_score || 0) >= 80).length;
  const mediumFitCount = allCreators.filter((c) => {
    const score = c.brand_fit_score || 0;
    return score >= 60 && score < 80;
  }).length;
  const lowFitCount = allCreators.filter((c) => (c.brand_fit_score || 0) < 60).length;

  // 가장 많이 나온 플랫폼
  const platformCounts = allCreators.reduce((acc, c) => {
    acc[c.platform] = (acc[c.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPlatform = Object.entries(platformCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'youtube';

  // 추천사항 생성
  const recommendations: string[] = [];

  if (highFitCount > 0) {
    recommendations.push(`적합도 80점 이상의 우수 크리에이터가 ${highFitCount}명 있습니다.`);
    recommendations.push('우선적으로 협업을 제안하는 것을 추천합니다.');
  }

  if (topCreators.length > 0) {
    const topCreator = topCreators[0];
    recommendations.push(`@${topCreator.username} 크리에이터와의 협업을 최우선으로 검토하세요.`);
  }

  if (allCreators.length === 0) {
    recommendations.push('등록된 크리에이터가 없습니다. 크리에이터 매칭을 실행해주세요.');
  }

  return {
    date: today.toISOString().split('T')[0],
    totalCreators: allCreators.length,
    topCreators,
    summary: {
      averageBrandFitScore: Math.round(avgBrandFitScore),
      highFitCount,
      mediumFitCount,
      lowFitCount,
      topPlatform,
    },
    recommendations,
  };
}
