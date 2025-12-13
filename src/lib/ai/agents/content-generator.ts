/**
 * 콘텐츠 아이디어 생성 AI Agent
 * - 트렌드 기반 콘텐츠 아이디어 생성
 * - 브랜드별 맞춤 전략
 * - 상세한 제작 가이드
 */

import { z } from 'zod';
import { generateAIObject, type AIMessage } from '@/lib/ai/utils';
import { type ProviderConfig } from '@/lib/ai/providers';
import { loadPrompt } from '@/lib/ai/prompts/loader';

// 장면 구성 스키마
const SceneSchema = z.object({
  duration: z.string().describe('장면 길이 (예: "2초", "3-5초")'),
  description: z.string().describe('장면 설명'),
  camera_angle: z.string().optional().describe('카메라 앵글'),
  action: z.string().describe('액션/동작'),
});

// 예상 성과 스키마
const PerformanceSchema = z.object({
  estimated_views: z.string().describe('예상 조회수'),
  estimated_engagement: z.string().describe('예상 참여율'),
  virality_potential: z.enum(['high', 'medium', 'low']).describe('바이럴 잠재력'),
});

// 콘텐츠 아이디어 응답 스키마
export const ContentIdeaSchema = z.object({
  // 기본 정보
  title: z.string().describe('콘텐츠 제목'),
  brand_category: z.enum(['buldak', 'samyang_ramen', 'jelly']).describe('브랜드 카테고리'),
  tone: z.enum(['fun', 'kawaii', 'provocative', 'cool']).describe('톤앤매너'),
  target_country: z.enum(['KR', 'US', 'JP']).describe('타겟 국가'),

  // 콘텐츠 포맷
  format_type: z.enum(['Challenge', 'Recipe', 'ASMR', 'Comedy', 'Review', 'Tutorial']).describe('콘텐츠 포맷'),
  platform: z.enum(['tiktok', 'instagram', 'youtube']).describe('최적 플랫폼'),

  // 후킹 전략
  hook_text: z.string().describe('5초 후킹 텍스트'),
  hook_visual: z.string().describe('후킹 비주얼 요소'),

  // 장면 구성 (3-5개)
  scene_structure: z.array(SceneSchema).min(3).max(5).describe('장면 구성'),

  // 제작 가이드
  editing_format: z.string().describe('편집 포맷 (컷 속도, 전환 등)'),
  music_style: z.string().describe('음악 스타일'),
  props_needed: z.array(z.string()).describe('필요한 소품/재료'),

  // 해시태그 전략
  hashtags: z.array(z.string()).describe('추천 해시태그 (5-10개)'),

  // 예상 성과
  expected_performance: PerformanceSchema.describe('예상 성과'),

  // 주의사항
  production_tips: z.array(z.string()).describe('제작 팁'),
  common_mistakes: z.array(z.string()).describe('피해야 할 실수'),
});

export type ContentIdea = z.infer<typeof ContentIdeaSchema>;

// 콘텐츠 생성 입력 인터페이스
export interface GenerateContentIdeaInput {
  // 트렌드 정보
  trendKeyword?: string;
  trendDescription?: string;

  // 브랜드 정보
  brandCategory: 'buldak' | 'samyang_ramen' | 'jelly';
  tone: 'fun' | 'kawaii' | 'provocative' | 'cool';
  targetCountry: 'KR' | 'US' | 'JP';

  // 플랫폼 선호도
  preferredPlatform?: 'tiktok' | 'instagram' | 'youtube';

  // 추가 요구사항
  additionalRequirements?: string;
}

// 콘텐츠 생성 결과 인터페이스
export interface GenerateContentIdeaResult {
  data: ContentIdea | null;
  error: Error | null;
}

/**
 * 콘텐츠 아이디어 생성 함수
 */
export async function generateContentIdea(
  input: GenerateContentIdeaInput,
  config?: ProviderConfig & {
    temperature?: number;
    useCache?: boolean;
  }
): Promise<GenerateContentIdeaResult> {
  try {
    // 시스템 프롬프트 로드
    const systemPrompt = await loadPrompt('content-generator');

    // 사용자 프롬프트 구성
    const userPrompt = `
다음 조건에 맞는 숏폼 콘텐츠 아이디어를 생성해주세요:

**브랜드 정보**:
- 제품: ${input.brandCategory}
- 톤앤매너: ${input.tone}
- 타겟 국가: ${input.targetCountry}
${input.preferredPlatform ? `- 선호 플랫폼: ${input.preferredPlatform}` : ''}

**트렌드 정보**:
${input.trendKeyword ? `- 트렌드 키워드: ${input.trendKeyword}` : ''}
${input.trendDescription ? `- 트렌드 설명: ${input.trendDescription}` : ''}

${input.additionalRequirements ? `**추가 요구사항**:\n${input.additionalRequirements}` : ''}

위 조건에 맞는 실행 가능한 콘텐츠 아이디어를 JSON 형식으로 작성해주세요.
콘텐츠는 15-30초 길이의 숏폼이며, 첫 5초 안에 시청자를 후킹할 수 있어야 합니다.
`.trim();

    // 메시지 구성
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // AI 호출 (구조화된 객체 생성)
    const aiConfig = config?.provider ? {
      provider: config.provider,
      ...(config.model && { model: config.model }),
      ...(config.useCache !== undefined && { useCache: config.useCache }),
      temperature: config.temperature ?? 0.7, // 창의성을 위해 적당한 temperature
    } : undefined;

    const result = await generateAIObject<ContentIdea>(
      messages,
      ContentIdeaSchema,
      aiConfig
    );

    // 에러 처리
    if (result.error) {
      console.error('[Content Generator] Error:', result.error);
      return {
        data: null,
        error: result.error,
      };
    }

    // 데이터 검증
    if (!result.object) {
      return {
        data: null,
        error: new Error('No content idea returned from AI'),
      };
    }

    // 성공
    return {
      data: result.object,
      error: null,
    };
  } catch (error) {
    console.error('[Content Generator] Unexpected error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 다중 콘텐츠 아이디어 생성 (병렬 처리)
 */
export async function generateContentIdeas(
  inputs: GenerateContentIdeaInput[],
  config?: ProviderConfig & {
    temperature?: number;
    useCache?: boolean;
  }
): Promise<GenerateContentIdeaResult[]> {
  // Promise.all로 병렬 처리
  const results = await Promise.all(
    inputs.map((input) => generateContentIdea(input, config))
  );

  return results;
}

/**
 * 단일 트렌드에 대한 다양한 버전 생성
 */
export async function generateContentVariations(
  baseInput: GenerateContentIdeaInput,
  count: number = 3,
  config?: ProviderConfig & {
    temperature?: number;
    useCache?: boolean;
  }
): Promise<{
  variations: GenerateContentIdeaResult[];
  successCount: number;
}> {
  // 약간 다른 temperature로 여러 버전 생성
  const temperatures = [0.6, 0.7, 0.8];
  const variations: GenerateContentIdeaResult[] = [];

  for (let i = 0; i < Math.min(count, 5); i++) {
    const temperature = temperatures[i % temperatures.length];
    const variationConfig = config?.provider ? {
      provider: config.provider,
      ...(config.model && { model: config.model }),
      temperature,
      useCache: false, // 버전 생성 시 캐시 사용 안 함
    } : undefined;

    const result = await generateContentIdea(baseInput, variationConfig);
    variations.push(result);
  }

  const successCount = variations.filter((v) => v.data !== null).length;

  return {
    variations,
    successCount,
  };
}

/**
 * 트렌드 + 크리에이터 기반 맞춤 콘텐츠 생성
 */
export async function generatePersonalizedContent(
  input: GenerateContentIdeaInput & {
    creatorUsername?: string;
    creatorStyle?: string;
    creatorAudience?: string;
  },
  config?: ProviderConfig & {
    temperature?: number;
    useCache?: boolean;
  }
): Promise<GenerateContentIdeaResult> {
  // 크리에이터 정보를 추가 요구사항에 통합
  const enhancedInput: GenerateContentIdeaInput = {
    ...input,
    additionalRequirements: `
${input.additionalRequirements || ''}

**크리에이터 정보**:
${input.creatorUsername ? `- 유저네임: ${input.creatorUsername}` : ''}
${input.creatorStyle ? `- 콘텐츠 스타일: ${input.creatorStyle}` : ''}
${input.creatorAudience ? `- 오디언스: ${input.creatorAudience}` : ''}

이 크리에이터의 스타일과 오디언스에 맞는 콘텐츠를 제안해주세요.
`.trim(),
  };

  return generateContentIdea(enhancedInput, config);
}
