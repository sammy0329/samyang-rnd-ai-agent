/**
 * AI Provider 선택 및 관리
 */

import { openai, openaiModels, defaultOpenAIModel } from './openai';
import { anthropic, anthropicModels, defaultAnthropicModel } from './anthropic';

// Provider 타입 정의
export type ProviderType = 'openai' | 'anthropic';

// 모델 타입 정의
export type ModelType =
  | 'gpt-4-turbo'
  | 'gpt-4'
  | 'gpt-4-mini'
  | 'gpt-3.5-turbo'
  | 'claude-opus'
  | 'claude-sonnet'
  | 'claude-haiku';

// Provider 설정 인터페이스
export interface ProviderConfig {
  provider: ProviderType;
  model?: ModelType;
}

/**
 * Provider와 모델을 선택하여 반환
 */
export function getModel(config?: ProviderConfig) {
  const provider = config?.provider || getDefaultProvider();
  const modelType = config?.model;

  if (provider === 'openai') {
    if (!modelType) return defaultOpenAIModel;

    switch (modelType) {
      case 'gpt-4-turbo':
        return openaiModels.gpt4Turbo;
      case 'gpt-4':
        return openaiModels.gpt4;
      case 'gpt-4-mini':
        return openaiModels.gpt4Mini;
      case 'gpt-3.5-turbo':
        return openaiModels.gpt35Turbo;
      default:
        return defaultOpenAIModel;
    }
  }

  if (provider === 'anthropic') {
    if (!modelType) return defaultAnthropicModel;

    switch (modelType) {
      case 'claude-opus':
        return anthropicModels.claudeOpus;
      case 'claude-sonnet':
        return anthropicModels.claudeSonnet;
      case 'claude-haiku':
        return anthropicModels.claudeHaiku;
      default:
        return defaultAnthropicModel;
    }
  }

  // 기본값: OpenAI GPT-4 Mini
  return defaultOpenAIModel;
}

/**
 * 환경 변수에서 기본 provider 가져오기
 */
function getDefaultProvider(): ProviderType {
  const defaultProvider = process.env.DEFAULT_AI_PROVIDER as ProviderType;

  if (defaultProvider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    return 'anthropic';
  }

  if (defaultProvider === 'openai' && process.env.OPENAI_API_KEY) {
    return 'openai';
  }

  // API 키가 있는 provider 자동 선택
  if (process.env.ANTHROPIC_API_KEY) {
    return 'anthropic';
  }

  return 'openai';
}

/**
 * 사용 가능한 provider 목록 반환
 */
export function getAvailableProviders(): ProviderType[] {
  const providers: ProviderType[] = [];

  if (process.env.OPENAI_API_KEY) {
    providers.push('openai');
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push('anthropic');
  }

  return providers;
}

// Export providers
export { openai, openaiModels, defaultOpenAIModel } from './openai';
export { anthropic, anthropicModels, defaultAnthropicModel } from './anthropic';
