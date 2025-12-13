/**
 * 크리에이터 매칭 AI Agent
 * - 크리에이터 프로필 분석
 * - 브랜드 적합도 점수 산정
 * - 협업 전략 제안
 */

import { z } from 'zod';
import { generateAIObject, type AIMessage } from '@/lib/ai/utils';
import { type ProviderConfig } from '@/lib/ai/providers';
import { loadPrompt } from '@/lib/ai/prompts/loader';

// 크리에이터 매칭 응답 스키마
export const CreatorMatchingSchema = z.object({
  // 크리에이터 기본 정보
  creator_username: z.string().describe('크리에이터 유저네임'),
  platform: z.enum(['tiktok', 'instagram', 'youtube']).describe('플랫폼'),

  // 종합 점수
  total_fit_score: z.number().min(0).max(100).describe('종합 적합도 점수 (0-100)'),

  // 정량 평가 (40점)
  quantitative_scores: z.object({
    follower_score: z.number().min(0).max(15).describe('팔로워 규모 점수 (0-15)'),
    view_score: z.number().min(0).max(15).describe('평균 조회수 점수 (0-15)'),
    engagement_score: z.number().min(0).max(10).describe('참여율 점수 (0-10)'),
  }).describe('정량 평가'),

  // 정성 평가 (60점)
  qualitative_scores: z.object({
    category_fit: z.number().min(0).max(20).describe('카테고리 적합성 (0-20)'),
    tone_fit: z.number().min(0).max(20).describe('톤앤매너 적합성 (0-20)'),
    audience_fit: z.number().min(0).max(20).describe('오디언스 적합성 (0-20)'),
  }).describe('정성 평가'),

  // 분석 내용
  strengths: z.array(z.string()).describe('강점'),
  weaknesses: z.array(z.string()).describe('약점'),
  audience_analysis: z.string().describe('오디언스 분석'),
  content_style_analysis: z.string().describe('콘텐츠 스타일 분석'),

  // 협업 전략
  collaboration_strategy: z.object({
    recommended_type: z.enum(['long_term_ambassador', 'campaign_series', 'one_off_collaboration', 'product_review']).describe('추천 협업 유형'),
    content_suggestions: z.array(z.string()).describe('콘텐츠 제안'),
    estimated_performance: z.string().describe('예상 성과'),
    budget_recommendation: z.string().describe('예산 권장사항'),
  }).describe('협업 전략'),

  // 리스크 평가
  risk_assessment: z.object({
    level: z.enum(['high', 'medium', 'low']).describe('리스크 레벨'),
    factors: z.array(z.string()).describe('리스크 요인'),
    mitigation: z.array(z.string()).describe('완화 방안'),
  }).describe('리스크 평가'),

  // 추천 제품
  recommended_products: z.array(z.enum(['buldak', 'samyang_ramen', 'jelly'])).describe('추천 제품'),
});

export type CreatorMatching = z.infer<typeof CreatorMatchingSchema>;

// 크리에이터 매칭 입력 인터페이스
export interface MatchCreatorInput {
  // 크리에이터 정보
  username: string;
  platform: 'tiktok' | 'instagram' | 'youtube';
  followerCount?: number;
  avgViews?: number;
  engagementRate?: number;
  contentCategory?: string;
  toneManner?: string;

  // 캠페인 정보
  campaignPurpose?: string;
  targetProduct?: 'buldak' | 'samyang_ramen' | 'jelly';
  targetCountry?: 'KR' | 'US' | 'JP';

  // 추가 정보
  additionalContext?: string;
}

// 크리에이터 매칭 결과 인터페이스
export interface MatchCreatorResult {
  data: CreatorMatching | null;
  error: Error | null;
}

/**
 * 크리에이터 매칭 함수
 */
export async function matchCreator(
  input: MatchCreatorInput,
  config?: ProviderConfig & {
    temperature?: number;
    useCache?: boolean;
  }
): Promise<MatchCreatorResult> {
  try {
    // 시스템 프롬프트 로드
    const systemPrompt = await loadPrompt('creator-matcher');

    // 사용자 프롬프트 구성
    const userPrompt = `
다음 크리에이터와 삼양 브랜드의 매칭을 분석해주세요:

**크리에이터 정보**:
- 유저네임: ${input.username}
- 플랫폼: ${input.platform}
${input.followerCount ? `- 팔로워 수: ${input.followerCount.toLocaleString()}` : ''}
${input.avgViews ? `- 평균 조회수: ${input.avgViews.toLocaleString()}` : ''}
${input.engagementRate ? `- 참여율: ${input.engagementRate}%` : ''}
${input.contentCategory ? `- 콘텐츠 카테고리: ${input.contentCategory}` : ''}
${input.toneManner ? `- 톤앤매너: ${input.toneManner}` : ''}

**캠페인 정보**:
${input.campaignPurpose ? `- 캠페인 목적: ${input.campaignPurpose}` : '- 캠페인 목적: 일반 브랜드 협업'}
${input.targetProduct ? `- 타겟 제품: ${input.targetProduct}` : ''}
${input.targetCountry ? `- 타겟 국가: ${input.targetCountry}` : ''}
${input.additionalContext ? `\n**추가 정보**: ${input.additionalContext}` : ''}

위 크리에이터의 삼양 브랜드 적합도를 분석하고, JSON 형식으로 응답해주세요.
`.trim();

    // 메시지 구성
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // AI 호출 (구조화된 객체 생성)
    const result = await generateAIObject<CreatorMatching>(
      messages,
      CreatorMatchingSchema,
      {
        ...config,
        temperature: config?.temperature ?? 0.3, // 일관성 있는 분석을 위해 낮은 temperature
      }
    );

    // 에러 처리
    if (result.error) {
      console.error('[Creator Matcher] Error:', result.error);
      return {
        data: null,
        error: result.error,
      };
    }

    // 데이터 검증
    if (!result.object) {
      return {
        data: null,
        error: new Error('No matching result returned from AI'),
      };
    }

    // 성공
    return {
      data: result.object,
      error: null,
    };
  } catch (error) {
    console.error('[Creator Matcher] Unexpected error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 다중 크리에이터 매칭 (병렬 처리)
 */
export async function matchCreators(
  inputs: MatchCreatorInput[],
  config?: ProviderConfig & {
    temperature?: number;
    useCache?: boolean;
  }
): Promise<MatchCreatorResult[]> {
  // Promise.all로 병렬 처리
  const results = await Promise.all(
    inputs.map((input) => matchCreator(input, config))
  );

  return results;
}

/**
 * 크리에이터 순위 매기기 (적합도 순)
 */
export async function rankCreators(
  inputs: MatchCreatorInput[],
  config?: ProviderConfig & {
    temperature?: number;
    useCache?: boolean;
  }
): Promise<{
  matches: MatchCreatorResult[];
  ranking: CreatorMatching[];
  topPick: CreatorMatching | null;
}> {
  // 모든 크리에이터 매칭
  const matches = await matchCreators(inputs, config);

  // 성공한 매칭만 필터링
  const successfulMatches = matches
    .filter((result) => result.data !== null)
    .map((result) => result.data!);

  if (successfulMatches.length === 0) {
    return {
      matches,
      ranking: [],
      topPick: null,
    };
  }

  // 적합도 점수로 정렬
  const ranking = successfulMatches.sort(
    (a, b) => b.total_fit_score - a.total_fit_score
  );

  return {
    matches,
    ranking,
    topPick: ranking[0],
  };
}
