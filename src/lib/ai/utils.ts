/**
 * AI 유틸리티 함수 (고도화 버전)
 * - 리트라이 로직
 * - 에러 핸들링
 * - 토큰 사용량 추적
 * - 응답 캐싱
 */

import { generateText, generateObject, streamText } from 'ai';
import { getModel, type ProviderConfig } from './providers';
import {
  generateCacheKey,
  getCachedResponse,
  setCachedResponse,
} from '@/lib/cache/ai-cache';

// 리트라이 설정
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// 메시지 타입 (AI SDK 호환)
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 토큰 사용량 추적 인터페이스
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// AI 호출 로그 인터페이스
export interface AICallLog {
  provider: string;
  model: string;
  usage: TokenUsage | null;
  duration: number;
  success: boolean;
  error?: string;
}

/**
 * 지연 함수 (리트라이용)
 */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 리트라이 가능한 에러인지 확인
 */
function isRetryableError(error: Error): boolean {
  const retryableMessages = [
    'rate limit',
    'timeout',
    'network',
    'ECONNRESET',
    'ETIMEDOUT',
    '429',
    '500',
    '502',
    '503',
    '504',
  ];

  const errorMessage = error.message.toLowerCase();
  return retryableMessages.some((msg) => errorMessage.includes(msg));
}

/**
 * 토큰 사용량 로그 저장 (비동기, 에러 무시)
 */
async function logTokenUsage(log: AICallLog): Promise<void> {
  try {
    // 개발 모드에서 콘솔 로그
    if (process.env.NODE_ENV === 'development') {
      console.log('[AI Call]', {
        provider: log.provider,
        model: log.model,
        tokens: log.usage?.totalTokens,
        duration: `${log.duration}ms`,
        success: log.success,
      });
    }

    // DB에 저장 (프로덕션에서만 또는 항상)
    // Note: 서버 컴포넌트에서만 동작 (createAPIUsage는 서버 전용)
    if (typeof window === 'undefined') {
      try {
        const { createAPIUsage } = await import('@/lib/db/queries/api-usage');
        const { calculateCost, getModelName } = await import('./token-counter');

        // 비용 계산
        let cost = 0;
        if (log.usage) {
          const modelName = getModelName(log.provider, log.model);
          if (modelName) {
            const costCalc = calculateCost(log.usage, modelName);
            cost = costCalc.totalCost;
          }
        }

        // DB에 기록 (비동기, await하지 않음)
        createAPIUsage({
          endpoint: `ai/${log.model}`,
          method: 'POST',
          tokens_used: log.usage?.totalTokens || 0,
          cost,
          response_time_ms: log.duration,
          status_code: log.success ? 200 : 500,
        }).catch((err) => {
          // DB 저장 실패해도 무시
          console.error('Failed to save API usage to DB:', err);
        });
      } catch (importError) {
        // Import 실패 무시 (클라이언트 사이드일 수 있음)
      }
    }
  } catch (error) {
    // 로깅 실패해도 무시 (메인 로직에 영향 없도록)
    console.error('Failed to log token usage:', error);
  }
}

/**
 * 텍스트 생성 래퍼 함수 (리트라이 로직 + 캐싱 포함)
 */
export async function generateAIText(
  messages: AIMessage[],
  config?: ProviderConfig & {
    temperature?: number;
    maxRetries?: number;
    useCache?: boolean;
    cacheTTL?: number;
  }
) {
  const maxRetries = config?.maxRetries ?? MAX_RETRIES;
  const useCache = config?.useCache ?? true; // 기본적으로 캐싱 활성화
  const cacheTTL = config?.cacheTTL; // undefined면 기본값 사용
  const startTime = Date.now();
  let lastError: Error | null = null;

  // 캐시 확인 (서버 사이드에서만)
  if (useCache && typeof window === 'undefined') {
    try {
      const cacheKey = generateCacheKey(messages, {
        provider: config?.provider,
        model: config?.model,
        temperature: config?.temperature ?? 0.7,
      });

      const cached = await getCachedResponse<{
        text: string;
        usage: any;
        finishReason: string;
      }>(cacheKey);

      if (cached) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AI Cache] Hit:', cacheKey.substring(0, 20) + '...');
        }
        return {
          ...cached,
          error: null,
        };
      }
    } catch (cacheError) {
      // 캐시 조회 실패는 무시하고 계속 진행
      console.warn('[AI Cache] Failed to get cached response:', cacheError);
    }
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = getModel(config);

      const result = await generateText({
        model,
        messages,
        temperature: config?.temperature ?? 0.7,
      });

      // 성공 로그
      const duration = Date.now() - startTime;
      const usageData = result.usage as any;
      await logTokenUsage({
        provider: config?.provider || 'default',
        model: 'text-generation',
        usage: usageData
          ? {
              promptTokens: usageData.promptTokens || 0,
              completionTokens: usageData.completionTokens || 0,
              totalTokens: usageData.totalTokens || 0,
            }
          : null,
        duration,
        success: true,
      });

      // 캐시에 저장 (서버 사이드에서만)
      if (useCache && typeof window === 'undefined') {
        try {
          const cacheKey = generateCacheKey(messages, {
            provider: config?.provider,
            model: config?.model,
            temperature: config?.temperature ?? 0.7,
          });

          const responseToCache = {
            text: result.text,
            usage: result.usage,
            finishReason: result.finishReason,
          };

          await setCachedResponse(cacheKey, responseToCache, cacheTTL);
        } catch (cacheError) {
          // 캐시 저장 실패는 무시
          console.warn('[AI Cache] Failed to save response:', cacheError);
        }
      }

      return {
        text: result.text,
        usage: result.usage,
        finishReason: result.finishReason,
        error: null,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // 리트라이 가능한 에러인지 확인
      if (attempt < maxRetries && isRetryableError(lastError)) {
        console.warn(
          `[AI] Retry attempt ${attempt + 1}/${maxRetries} after error:`,
          lastError.message
        );
        await delay(RETRY_DELAY_MS * (attempt + 1)); // 지수 백오프
        continue;
      }

      // 리트라이 불가능하거나 최대 시도 횟수 초과
      break;
    }
  }

  // 실패 로그
  const duration = Date.now() - startTime;
  await logTokenUsage({
    provider: config?.provider || 'default',
    model: 'text-generation',
    usage: null,
    duration,
    success: false,
    error: lastError?.message,
  });

  console.error('Error generating text after retries:', lastError);
  return {
    text: null,
    usage: null,
    finishReason: null,
    error: lastError,
  };
}

/**
 * 스트리밍 텍스트 생성 래퍼 함수
 */
export async function streamAIText(
  messages: AIMessage[],
  config?: ProviderConfig & {
    temperature?: number;
  }
) {
  try {
    const model = getModel(config);

    const result = streamText({
      model,
      messages,
      temperature: config?.temperature ?? 0.7,
    });

    return {
      textStream: result.textStream,
      error: null,
    };
  } catch (error) {
    console.error('Error streaming text:', error);
    return {
      textStream: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 구조화된 객체 생성 래퍼 함수 (리트라이 로직 + 캐싱 포함)
 */
export async function generateAIObject<T>(
  messages: AIMessage[],
  schema: any,
  config?: ProviderConfig & {
    temperature?: number;
    maxRetries?: number;
    useCache?: boolean;
    cacheTTL?: number;
  }
) {
  const maxRetries = config?.maxRetries ?? MAX_RETRIES;
  const useCache = config?.useCache ?? true; // 기본적으로 캐싱 활성화
  const cacheTTL = config?.cacheTTL; // undefined면 기본값 사용
  const startTime = Date.now();
  let lastError: Error | null = null;

  // 캐시 확인 (서버 사이드에서만)
  if (useCache && typeof window === 'undefined') {
    try {
      const cacheKey = generateCacheKey(messages, {
        provider: config?.provider,
        model: config?.model,
        temperature: config?.temperature ?? 0.7,
      });

      const cached = await getCachedResponse<{
        object: T;
        usage: any;
        finishReason: string;
      }>(cacheKey);

      if (cached) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AI Cache] Hit:', cacheKey.substring(0, 20) + '...');
        }
        return {
          ...cached,
          error: null,
        };
      }
    } catch (cacheError) {
      // 캐시 조회 실패는 무시하고 계속 진행
      console.warn('[AI Cache] Failed to get cached response:', cacheError);
    }
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = getModel(config);

      const result = await generateObject({
        model,
        schema,
        messages,
        temperature: config?.temperature ?? 0.7,
      });

      // 성공 로그
      const duration = Date.now() - startTime;
      const usageData = result.usage as any;
      await logTokenUsage({
        provider: config?.provider || 'default',
        model: 'object-generation',
        usage: usageData
          ? {
              promptTokens: usageData.promptTokens || 0,
              completionTokens: usageData.completionTokens || 0,
              totalTokens: usageData.totalTokens || 0,
            }
          : null,
        duration,
        success: true,
      });

      // 캐시에 저장 (서버 사이드에서만)
      if (useCache && typeof window === 'undefined') {
        try {
          const cacheKey = generateCacheKey(messages, {
            provider: config?.provider,
            model: config?.model,
            temperature: config?.temperature ?? 0.7,
          });

          const responseToCache = {
            object: result.object,
            usage: result.usage,
            finishReason: result.finishReason,
          };

          await setCachedResponse(cacheKey, responseToCache, cacheTTL);
        } catch (cacheError) {
          // 캐시 저장 실패는 무시
          console.warn('[AI Cache] Failed to save response:', cacheError);
        }
      }

      return {
        object: result.object as T,
        usage: result.usage,
        finishReason: result.finishReason,
        error: null,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // 리트라이 가능한 에러인지 확인
      if (attempt < maxRetries && isRetryableError(lastError)) {
        console.warn(
          `[AI] Retry attempt ${attempt + 1}/${maxRetries} after error:`,
          lastError.message
        );
        await delay(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      break;
    }
  }

  // 실패 로그
  const duration = Date.now() - startTime;
  await logTokenUsage({
    provider: config?.provider || 'default',
    model: 'object-generation',
    usage: null,
    duration,
    success: false,
    error: lastError?.message,
  });

  console.error('Error generating object after retries:', lastError);
  return {
    object: null,
    usage: null,
    finishReason: null,
    error: lastError,
  };
}

/**
 * 간단한 채팅 완성 함수 (테스트용)
 */
export async function simpleChat(
  prompt: string,
  config?: ProviderConfig
): Promise<string | null> {
  const result = await generateAIText([{ role: 'user', content: prompt }], config);

  return result.text;
}
