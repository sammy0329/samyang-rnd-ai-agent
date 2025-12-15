/**
 * AI 응답 캐싱 헬퍼 함수
 */

import { getRedisClient } from './redis';
import crypto from 'crypto';

// 기본 TTL (24시간)
const DEFAULT_TTL = 60 * 60 * 24;

// Message interface for AI
interface CacheMessage {
  role: string;
  content: string;
}

/**
 * 캐시 키 생성 (메시지 + 설정으로 해시 생성)
 */
export function generateCacheKey(
  messages: CacheMessage[],
  config?: {
    provider?: string;
    model?: string;
    temperature?: number;
  }
): string {
  // 캐시 키 생성을 위한 데이터 조합
  const cacheData = {
    messages,
    provider: config?.provider || 'default',
    model: config?.model || 'default',
    temperature: config?.temperature ?? 0.7,
  };

  // JSON 문자열로 변환 후 SHA256 해시
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(cacheData))
    .digest('hex');

  // 접두사 추가
  return `ai:response:${hash}`;
}

/**
 * 캐시에서 AI 응답 조회
 */
export async function getCachedResponse<T = unknown>(
  cacheKey: string
): Promise<T | null> {
  const redis = getRedisClient();

  if (!redis) {
    return null;
  }

  try {
    // Upstash Redis는 자동으로 JSON을 역직렬화하므로 JSON.parse 불필요
    const cached = await redis.get<T>(cacheKey);

    if (!cached) {
      return null;
    }

    return cached;
  } catch (error) {
    console.error('Error getting cached response:', error);
    return null;
  }
}

/**
 * AI 응답을 캐시에 저장
 */
export async function setCachedResponse<T = unknown>(
  cacheKey: string,
  response: T,
  ttl: number = DEFAULT_TTL
): Promise<boolean> {
  const redis = getRedisClient();

  if (!redis) {
    return false;
  }

  try {
    // Upstash Redis는 자동으로 JSON을 직렬화하므로 JSON.stringify 불필요
    await redis.setex(cacheKey, ttl, response);
    return true;
  } catch (error) {
    console.error('Error setting cached response:', error);
    return false;
  }
}

/**
 * 특정 캐시 키 삭제
 */
export async function deleteCachedResponse(cacheKey: string): Promise<boolean> {
  const redis = getRedisClient();

  if (!redis) {
    return false;
  }

  try {
    await redis.del(cacheKey);
    return true;
  } catch (error) {
    console.error('Error deleting cached response:', error);
    return false;
  }
}

/**
 * 패턴에 맞는 캐시 키 모두 삭제
 */
export async function clearCacheByPattern(pattern: string): Promise<number> {
  const redis = getRedisClient();

  if (!redis) {
    return 0;
  }

  try {
    // Upstash Redis는 SCAN을 직접 지원하지 않으므로 개별 키 삭제만 지원
    // 전체 캐시 무효화가 필요한 경우 개별적으로 처리
    console.warn('Pattern-based cache clearing is not implemented for Upstash Redis');
    return 0;
  } catch (error) {
    console.error('Error clearing cache by pattern:', error);
    return 0;
  }
}

/**
 * 캐시 통계 조회 (개발용)
 */
export async function getCacheStats(): Promise<{
  available: boolean;
  keyCount?: number;
  error?: string;
}> {
  const redis = getRedisClient();

  if (!redis) {
    return { available: false, error: 'Redis not configured' };
  }

  try {
    // Upstash Redis는 INFO 명령어를 제한적으로 지원
    // 기본 연결 테스트만 수행
    await redis.ping();
    return { available: true };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 캐시 무효화 (특정 조건)
 */
export async function invalidateCache(options: {
  provider?: string;
  model?: string;
}): Promise<void> {
  // Upstash Redis 제한으로 인해 개별 키 삭제만 지원
  // 실제 구현 시 키 패턴을 저장하고 추적하는 방식 필요
  console.warn('Cache invalidation by options is not fully implemented');
}
