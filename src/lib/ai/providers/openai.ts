/**
 * OpenAI Provider 설정
 */

import { createOpenAI } from '@ai-sdk/openai';

// OpenAI API 키 확인 (optional - Anthropic만 사용할 수도 있음)
const apiKey = process.env.OPENAI_API_KEY || '';

// OpenAI provider 생성
// 주의: API 키가 없으면 사용 시 에러 발생 (getDefaultProvider에서 검증)
export const openai = createOpenAI({
  apiKey,
});

// 자주 사용하는 모델 설정
export const openaiModels = {
  // GPT-4 Turbo - 고성능 작업용
  gpt4Turbo: openai('gpt-4-turbo-preview'),

  // GPT-4 - 안정적인 고성능
  gpt4: openai('gpt-4'),

  // GPT-4 Mini (GPT-4o mini) - 빠르고 저렴한 모델
  gpt4Mini: openai('gpt-4o-mini'),

  // GPT-3.5 Turbo - 빠르고 비용 효율적
  gpt35Turbo: openai('gpt-3.5-turbo'),
} as const;

// 기본 모델 (비용 효율성을 위해 GPT-4 Mini 사용)
export const defaultOpenAIModel = openaiModels.gpt4Mini;
