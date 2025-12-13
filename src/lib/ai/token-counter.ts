/**
 * 토큰 카운팅 및 비용 계산
 */

import type { TokenUsage } from './utils';

// 모델별 가격 (USD per 1M tokens) - 2025년 1월 기준
export const MODEL_PRICING = {
  // OpenAI
  'gpt-4-turbo': {
    input: 10.0,
    output: 30.0,
  },
  'gpt-4': {
    input: 30.0,
    output: 60.0,
  },
  'gpt-4-mini': {
    input: 0.15,
    output: 0.6,
  },
  'gpt-3.5-turbo': {
    input: 0.5,
    output: 1.5,
  },
  // Anthropic Claude
  'claude-opus': {
    input: 15.0,
    output: 75.0,
  },
  'claude-sonnet': {
    input: 3.0,
    output: 15.0,
  },
  'claude-haiku': {
    input: 0.25,
    output: 1.25,
  },
} as const;

export type ModelName = keyof typeof MODEL_PRICING;

/**
 * 비용 계산 결과
 */
export interface CostCalculation {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: 'USD';
}

/**
 * 토큰 사용량으로 비용 계산
 */
export function calculateCost(
  usage: TokenUsage,
  modelName: ModelName
): CostCalculation {
  const pricing = MODEL_PRICING[modelName];

  if (!pricing) {
    throw new Error(`Unknown model: ${modelName}`);
  }

  // 비용 계산 (USD)
  const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;

  return {
    inputCost: parseFloat(inputCost.toFixed(6)),
    outputCost: parseFloat(outputCost.toFixed(6)),
    totalCost: parseFloat(totalCost.toFixed(6)),
    currency: 'USD',
  };
}

/**
 * 모델 이름 매핑 (provider + model type → ModelName)
 */
export function getModelName(
  provider: string,
  modelType?: string
): ModelName | null {
  if (provider === 'openai') {
    switch (modelType) {
      case 'gpt-4-turbo':
        return 'gpt-4-turbo';
      case 'gpt-4':
        return 'gpt-4';
      case 'gpt-4-mini':
        return 'gpt-4-mini';
      case 'gpt-3.5-turbo':
        return 'gpt-3.5-turbo';
      default:
        return 'gpt-4-mini'; // 기본값
    }
  }

  if (provider === 'anthropic') {
    switch (modelType) {
      case 'claude-opus':
        return 'claude-opus';
      case 'claude-sonnet':
        return 'claude-sonnet';
      case 'claude-haiku':
        return 'claude-haiku';
      default:
        return 'claude-sonnet'; // 기본값
    }
  }

  return null;
}

/**
 * 비용 추정 (호출 전 예상 비용)
 */
export function estimateCost(
  estimatedInputTokens: number,
  estimatedOutputTokens: number,
  modelName: ModelName
): CostCalculation {
  return calculateCost(
    {
      promptTokens: estimatedInputTokens,
      completionTokens: estimatedOutputTokens,
      totalTokens: estimatedInputTokens + estimatedOutputTokens,
    },
    modelName
  );
}

/**
 * 토큰당 비용 (디버깅용)
 */
export function getCostPerToken(modelName: ModelName): {
  inputCostPer1K: number;
  outputCostPer1K: number;
} {
  const pricing = MODEL_PRICING[modelName];

  if (!pricing) {
    throw new Error(`Unknown model: ${modelName}`);
  }

  return {
    inputCostPer1K: pricing.input / 1000,
    outputCostPer1K: pricing.output / 1000,
  };
}

/**
 * 비용 포맷팅 (사람이 읽기 쉽게)
 */
export function formatCost(cost: number, currency: 'USD' = 'USD'): string {
  if (cost < 0.01) {
    // 1센트 미만은 밀리센트로 표시
    return `$${(cost * 1000).toFixed(3)}m`;
  }

  return `$${cost.toFixed(4)}`;
}

/**
 * 월별 비용 추정 (일일 호출 횟수 기반)
 */
export function estimateMonthlyCost(
  dailyCalls: number,
  avgInputTokens: number,
  avgOutputTokens: number,
  modelName: ModelName
): {
  dailyCost: number;
  monthlyCost: number;
  formattedDaily: string;
  formattedMonthly: string;
} {
  const costPerCall = calculateCost(
    {
      promptTokens: avgInputTokens,
      completionTokens: avgOutputTokens,
      totalTokens: avgInputTokens + avgOutputTokens,
    },
    modelName
  );

  const dailyCost = costPerCall.totalCost * dailyCalls;
  const monthlyCost = dailyCost * 30;

  return {
    dailyCost,
    monthlyCost,
    formattedDaily: formatCost(dailyCost),
    formattedMonthly: formatCost(monthlyCost),
  };
}

/**
 * 사용 가능한 모델 목록 조회
 */
export function getAvailableModels(): ModelName[] {
  return Object.keys(MODEL_PRICING) as ModelName[];
}

/**
 * 가장 저렴한 모델 찾기
 */
export function getCheapestModel(provider?: 'openai' | 'anthropic'): ModelName {
  const models = getAvailableModels();
  const filteredModels = provider
    ? models.filter((model) => {
        if (provider === 'openai') return model.startsWith('gpt');
        if (provider === 'anthropic') return model.startsWith('claude');
        return false;
      })
    : models;

  let cheapest: ModelName = filteredModels[0];
  let lowestCost = MODEL_PRICING[cheapest].input + MODEL_PRICING[cheapest].output;

  for (const model of filteredModels) {
    const totalCost = MODEL_PRICING[model].input + MODEL_PRICING[model].output;
    if (totalCost < lowestCost) {
      cheapest = model;
      lowestCost = totalCost;
    }
  }

  return cheapest;
}
