/**
 * 콘텐츠 아이디어 리포트 생성
 */

import { getContentIdeas } from '@/lib/db/queries/content';

export interface ContentIdeaReportData {
  date: string;
  totalIdeas: number;
  topIdeas: Array<{
    title: string;
    brandCategory: string;
    tone: string;
    platform?: string;
    formatType?: string;
    hookText: string;
    targetCountry: string;
  }>;
  summary: {
    buldakCount: number;
    samyangRamenCount: number;
    jellyCount: number;
    topTone: string;
    topCountry: string;
  };
  recommendations: string[];
}

/**
 * 콘텐츠 아이디어 리포트 생성
 */
export async function generateContentIdeaReport(): Promise<ContentIdeaReportData> {
  const today = new Date();

  // 모든 콘텐츠 아이디어 조회
  const ideasResult = await getContentIdeas({
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 100,
  });

  if (!ideasResult.data) {
    throw new Error('Failed to fetch content ideas');
  }

  const allIdeas = ideasResult.data;

  // Top 10 선정 (최신순)
  const topIdeas = allIdeas.slice(0, 10).map((idea) => {
    // scene_structure 파싱
    let formatType: string | undefined;
    try {
      const sceneData = idea.scene_structure as any;
      if (sceneData && typeof sceneData === 'object') {
        formatType = sceneData.format_type || sceneData.formatType;
      }
    } catch (e) {
      // ignore
    }

    return {
      title: idea.title || 'Untitled',
      brandCategory: idea.brand_category || 'unknown',
      tone: idea.tone || 'fun',
      platform: undefined, // DB에 없음
      formatType,
      hookText: idea.hook_text || '',
      targetCountry: idea.target_country || 'KR',
    };
  });

  // 브랜드별 카운트
  const buldakCount = allIdeas.filter((i) => i.brand_category === 'buldak').length;
  const samyangRamenCount = allIdeas.filter((i) => i.brand_category === 'samyang_ramen').length;
  const jellyCount = allIdeas.filter((i) => i.brand_category === 'jelly').length;

  // 톤앤매너 카운트
  const toneCounts = allIdeas.reduce((acc, i) => {
    if (i.tone) {
      acc[i.tone] = (acc[i.tone] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topTone = Object.entries(toneCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'fun';

  // 국가별 카운트
  const countryCounts = allIdeas.reduce((acc, i) => {
    if (i.target_country) {
      acc[i.target_country] = (acc[i.target_country] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCountry = Object.entries(countryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'KR';

  // 추천사항 생성
  const recommendations: string[] = [];

  if (allIdeas.length > 0) {
    recommendations.push(`총 ${allIdeas.length}개의 콘텐츠 아이디어가 생성되었습니다.`);

    if (buldakCount > 0) {
      recommendations.push(`불닭볶음면 아이디어 ${buldakCount}개를 우선적으로 검토하세요.`);
    }

    recommendations.push(`${topCountry} 시장을 타겟으로 한 콘텐츠가 가장 많습니다.`);

    if (topIdeas.length > 0) {
      const topIdea = topIdeas[0];
      recommendations.push(`"${topIdea.title}" 아이디어부터 제작을 시작하는 것을 추천합니다.`);
    }
  } else {
    recommendations.push('생성된 콘텐츠 아이디어가 없습니다. 아이디어 생성을 실행해주세요.');
  }

  return {
    date: today.toISOString().split('T')[0],
    totalIdeas: allIdeas.length,
    topIdeas,
    summary: {
      buldakCount,
      samyangRamenCount,
      jellyCount,
      topTone,
      topCountry,
    },
    recommendations,
  };
}
