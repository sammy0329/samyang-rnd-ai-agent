/**
 * 트렌드 분석 AI Agent
 * - 트렌드 키워드 분석
 * - 바이럴 점수 산정
 * - 삼양 브랜드 적합성 평가
 */

import { z } from 'zod';
import { generateAIObject, type AIMessage } from '@/lib/ai/utils';
import { type ProviderConfig } from '@/lib/ai/providers';
import { loadPrompt } from '@/lib/ai/prompts/loader';

// 트렌드 분석 응답 스키마
export const TrendAnalysisSchema = z.object({
  // 트렌드 기본 정보
  trend_name: z.string().describe('트렌드 이름'),
  platform: z.enum(['tiktok', 'instagram', 'youtube']).describe('플랫폼'),
  country: z.enum(['KR', 'US', 'JP']).describe('국가'),

  // 점수
  viral_score: z.number().min(0).max(100).describe('바이럴 점수 (0-100)'),
  samyang_relevance: z.number().min(0).max(100).describe('삼양 적합성 점수 (0-100)'),

  // 트렌드 분석
  format_type: z.string().describe('포맷 유형 (Challenge, Recipe, ASMR 등)'),
  hook_pattern: z.string().describe('후킹 패턴 분석'),
  visual_pattern: z.string().describe('비주얼 패턴 분석'),
  music_pattern: z.string().describe('음악 패턴 분석'),

  // 삼양 브랜드 적용 가능성
  brand_fit_reason: z.string().describe('브랜드 적합성 이유'),
  recommended_products: z.array(z.enum(['buldak', 'samyang_ramen', 'jelly'])).describe('추천 제품'),

  // 추가 인사이트
  target_audience: z.string().describe('타겟 오디언스'),
  estimated_reach: z.string().describe('예상 도달률'),
  key_success_factors: z.array(z.string()).describe('핵심 성공 요인'),
  risks: z.array(z.string()).describe('리스크 요인'),
});

export type TrendAnalysis = z.infer<typeof TrendAnalysisSchema>;

// 트렌드 분석 입력 인터페이스
export interface AnalyzeTrendInput {
  keyword: string;
  platform: 'tiktok' | 'instagram' | 'youtube';
  country: 'KR' | 'US' | 'JP';
  additionalContext?: string;
}

// 트렌드 분석 결과 인터페이스
export interface AnalyzeTrendResult {
  data: TrendAnalysis | null;
  error: Error | null;
  cached?: boolean;
}

/**
 * 트렌드 분석 함수
 */
export async function analyzeTrend(
  input: AnalyzeTrendInput,
  config?: ProviderConfig & {
    temperature?: number;
    useCache?: boolean;
  }
): Promise<AnalyzeTrendResult> {
  try {
    // 시스템 프롬프트 로드
    const systemPrompt = await loadPrompt('trend-analyzer');

    // 사용자 프롬프트 구성
    const userPrompt = `
다음 트렌드를 분석해주세요:

**키워드**: ${input.keyword}
**플랫폼**: ${input.platform}
**국가**: ${input.country}
${input.additionalContext ? `\n**추가 정보**: ${input.additionalContext}` : ''}

위 트렌드의 바이럴 잠재력과 삼양 브랜드 적합성을 분석하고, JSON 형식으로 응답해주세요.
`.trim();

    // 메시지 구성
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // AI 호출 (구조화된 객체 생성)
    const result = await generateAIObject<TrendAnalysis>(
      messages,
      TrendAnalysisSchema,
      {
        ...config,
        temperature: config?.temperature ?? 0.3, // 일관성 있는 분석을 위해 낮은 temperature
      }
    );

    // 에러 처리
    if (result.error) {
      console.error('[Trend Analyzer] Error:', result.error);
      return {
        data: null,
        error: result.error,
      };
    }

    // 데이터 검증
    if (!result.object) {
      return {
        data: null,
        error: new Error('No analysis result returned from AI'),
      };
    }

    // 성공
    return {
      data: result.object,
      error: null,
    };
  } catch (error) {
    console.error('[Trend Analyzer] Unexpected error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 다중 트렌드 분석 (병렬 처리)
 */
export async function analyzeTrends(
  inputs: AnalyzeTrendInput[],
  config?: ProviderConfig & {
    temperature?: number;
    useCache?: boolean;
  }
): Promise<AnalyzeTrendResult[]> {
  // Promise.all로 병렬 처리
  const results = await Promise.all(
    inputs.map((input) => analyzeTrend(input, config))
  );

  return results;
}

/**
 * 트렌드 비교 분석 (여러 트렌드를 비교하여 최적의 트렌드 추천)
 */
export async function compareTrends(
  inputs: AnalyzeTrendInput[],
  config?: ProviderConfig & {
    temperature?: number;
    useCache?: boolean;
  }
): Promise<{
  analyses: AnalyzeTrendResult[];
  bestTrend: TrendAnalysis | null;
  ranking: TrendAnalysis[];
}> {
  // 모든 트렌드 분석
  const analyses = await analyzeTrends(inputs, config);

  // 성공한 분석만 필터링
  const successfulAnalyses = analyses
    .filter((result) => result.data !== null)
    .map((result) => result.data!);

  if (successfulAnalyses.length === 0) {
    return {
      analyses,
      bestTrend: null,
      ranking: [],
    };
  }

  // 종합 점수 계산 (viral_score * 0.4 + samyang_relevance * 0.6)
  const ranked = successfulAnalyses
    .map((analysis) => ({
      ...analysis,
      totalScore: analysis.viral_score * 0.4 + analysis.samyang_relevance * 0.6,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return {
    analyses,
    bestTrend: ranked[0],
    ranking: ranked,
  };
}
