/**
 * Anthropic (Claude) Provider 설정
 */

import { createAnthropic } from '@ai-sdk/anthropic';

// Anthropic API 키 확인
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

// Anthropic provider 생성
export const anthropic = createAnthropic({
  apiKey,
});

// 자주 사용하는 Claude 모델 설정
export const anthropicModels = {
  // Claude Opus 4.5 - 최고 성능 모델
  claudeOpus: anthropic('claude-opus-4-5-20251101'),

  // Claude Sonnet 4.5 - 균형잡힌 성능
  claudeSonnet: anthropic('claude-sonnet-4-5-20250929'),

  // Claude Haiku - 빠르고 경량
  claudeHaiku: anthropic('claude-3-5-haiku-20241022'),
} as const;

// 기본 모델 (균형잡힌 성능의 Sonnet 사용)
export const defaultAnthropicModel = anthropicModels.claudeSonnet;
