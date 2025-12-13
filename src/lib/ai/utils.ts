/**
 * AI 유틸리티 함수
 */

import { generateText, generateObject, streamText } from 'ai';
import { getModel, type ProviderConfig } from './providers';
import type { CoreMessage } from 'ai';

/**
 * 텍스트 생성 래퍼 함수
 */
export async function generateAIText(
  messages: CoreMessage[],
  config?: ProviderConfig & {
    temperature?: number;
    maxTokens?: number;
  }
) {
  try {
    const model = getModel(config);

    const result = await generateText({
      model,
      messages,
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 2000,
    });

    return {
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      error: null,
    };
  } catch (error) {
    console.error('Error generating text:', error);
    return {
      text: null,
      usage: null,
      finishReason: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 스트리밍 텍스트 생성 래퍼 함수
 */
export async function streamAIText(
  messages: CoreMessage[],
  config?: ProviderConfig & {
    temperature?: number;
    maxTokens?: number;
  }
) {
  try {
    const model = getModel(config);

    const result = streamText({
      model,
      messages,
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 2000,
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
  messages: CoreMessage[],
  schema: any,
  config?: ProviderConfig & {
    temperature?: number;
    maxTokens?: number;
  }
) {
  try {
    const model = getModel(config);

    const result = await generateObject({
      model,
      schema,
      messages,
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 2000,
    });

    return {
      object: result.object as T,
      usage: result.usage,
      finishReason: result.finishReason,
      error: null,
    };
  } catch (error) {
    console.error('Error generating object:', error);
    return {
      object: null,
      usage: null,
      finishReason: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * 간단한 채팅 완성 함수 (테스트용)
 */
export async function simpleChat(
  prompt: string,
  config?: ProviderConfig
): Promise<string | null> {
  const result = await generateAIText(
    [{ role: 'user', content: prompt }],
    config
  );

  return result.text;
}
