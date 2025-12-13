/**
 * AI 유틸리티 함수 (고도화 버전)
 * - 리트라이 로직
 * - 에러 핸들링
 * - 토큰 사용량 추적
 */

import { generateText, generateObject, streamText } from 'ai';
import { getModel, type ProviderConfig } from './providers';

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
    // TODO: DB에 저장하는 로직 추가 (api_usage 테이블)
    // 현재는 콘솔에만 로그
    if (process.env.NODE_ENV === 'development') {
      console.log('[AI Call]', {
        provider: log.provider,
        model: log.model,
        tokens: log.usage?.totalTokens,
        duration: `${log.duration}ms`,
        success: log.success,
      });
    }
  } catch (error) {
    // 로깅 실패해도 무시 (메인 로직에 영향 없도록)
    console.error('Failed to log token usage:', error);
  }
}

/**
 * 텍스트 생성 래퍼 함수 (리트라이 로직 포함)
 */
export async function generateAIText(
  messages: AIMessage[],
  config?: ProviderConfig & {
    temperature?: number;
    maxRetries?: number;
  }
) {
  const maxRetries = config?.maxRetries ?? MAX_RETRIES;
  const startTime = Date.now();
  let lastError: Error | null = null;

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
 * 구조화된 객체 생성 래퍼 함수
 */
export async function generateAIObject<T>(
  messages: AIMessage[],
  schema: any,
  config?: ProviderConfig & {
    temperature?: number;
    maxRetries?: number;
  }
) {
  const maxRetries = config?.maxRetries ?? MAX_RETRIES;
  const startTime = Date.now();
  let lastError: Error | null = null;

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
