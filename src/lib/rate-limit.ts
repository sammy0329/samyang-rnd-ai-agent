/**
 * Rate Limiting 유틸리티
 * Upstash Redis를 사용한 API Rate Limiting
 */

import { getRedisClient } from '@/lib/cache/redis';

export interface RateLimitConfig {
  /**
   * 제한 기간 (초)
   * @default 60 (1분)
   */
  window?: number;

  /**
   * 제한 기간 내 최대 요청 수
   * @default 10
   */
  max?: number;

  /**
   * Rate limit 키 prefix
   * @default 'rate_limit'
   */
  prefix?: string;
}

export interface RateLimitResult {
  /**
   * 요청 허용 여부
   */
  success: boolean;

  /**
   * 제한 기간 내 최대 요청 수
   */
  limit: number;

  /**
   * 남은 요청 수
   */
  remaining: number;

  /**
   * 제한 해제 시간 (Unix timestamp)
   */
  reset: number;

  /**
   * 제한 기간 (초)
   */
  window: number;
}

/**
 * Rate limiting 검사 및 적용
 *
 * @param identifier - 고유 식별자 (IP, user ID 등)
 * @param config - Rate limit 설정
 * @returns Rate limit 결과
 *
 * @example
 * const result = await rateLimit('192.168.1.1', { max: 10, window: 60 });
 * if (!result.success) {
 *   return Response.json({ error: 'Too many requests' }, { status: 429 });
 * }
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): Promise<RateLimitResult> {
  const {
    window = 60, // 1분
    max = 10, // 10 requests
    prefix = 'rate_limit',
  } = config;

  const redis = getRedisClient();

  // Redis가 없으면 rate limiting 비활성화 (항상 허용)
  if (!redis) {
    console.warn('[Rate Limit] Redis not available. Rate limiting is disabled.');
    return {
      success: true,
      limit: max,
      remaining: max,
      reset: Date.now() + window * 1000,
      window,
    };
  }

  const key = `${prefix}:${identifier}`;
  const now = Date.now();
  const resetTime = now + window * 1000;

  try {
    // 현재 카운트 가져오기
    const currentCount = await redis.get<number>(key);

    if (currentCount === null) {
      // 첫 요청: 카운트 1로 설정하고 TTL 설정
      await redis.set(key, 1, { ex: window });

      return {
        success: true,
        limit: max,
        remaining: max - 1,
        reset: resetTime,
        window,
      };
    }

    // 제한 초과 확인
    if (currentCount >= max) {
      // TTL 확인하여 reset 시간 계산
      const ttl = await redis.ttl(key);
      const actualReset = ttl > 0 ? now + ttl * 1000 : resetTime;

      return {
        success: false,
        limit: max,
        remaining: 0,
        reset: actualReset,
        window,
      };
    }

    // 카운트 증가
    const newCount = await redis.incr(key);

    return {
      success: true,
      limit: max,
      remaining: Math.max(0, max - newCount),
      reset: resetTime,
      window,
    };
  } catch (error) {
    console.error('[Rate Limit] Redis error:', error);

    // Redis 에러 시 rate limiting 비활성화 (요청 허용)
    return {
      success: true,
      limit: max,
      remaining: max,
      reset: resetTime,
      window,
    };
  }
}

/**
 * 고급 Rate Limiting (토큰 버킷 알고리즘)
 *
 * @param identifier - 고유 식별자
 * @param config - Rate limit 설정
 * @returns Rate limit 결과
 */
export async function tokenBucketRateLimit(
  identifier: string,
  config: RateLimitConfig & {
    /**
     * 토큰 충전 속도 (초당 토큰 수)
     * @default 1
     */
    refillRate?: number;

    /**
     * 버킷 최대 용량
     * @default 10
     */
    capacity?: number;
  }
): Promise<RateLimitResult> {
  const {
    refillRate = 1,
    capacity = 10,
    prefix = 'token_bucket',
  } = config;

  const redis = getRedisClient();

  if (!redis) {
    return {
      success: true,
      limit: capacity,
      remaining: capacity,
      reset: Date.now() + 60000,
      window: 60,
    };
  }

  const key = `${prefix}:${identifier}`;
  const now = Date.now();

  try {
    const data = await redis.get<{ tokens: number; lastRefill: number }>(key);

    if (!data) {
      // 첫 요청: 버킷 초기화
      await redis.set(
        key,
        { tokens: capacity - 1, lastRefill: now },
        { ex: 3600 } // 1시간 후 자동 삭제
      );

      return {
        success: true,
        limit: capacity,
        remaining: capacity - 1,
        reset: now + (capacity / refillRate) * 1000,
        window: Math.ceil(capacity / refillRate),
      };
    }

    // 경과 시간에 따라 토큰 충전
    const elapsed = (now - data.lastRefill) / 1000;
    const tokensToAdd = Math.floor(elapsed * refillRate);
    const currentTokens = Math.min(capacity, data.tokens + tokensToAdd);

    if (currentTokens < 1) {
      // 토큰 부족
      const timeToNextToken = Math.ceil((1 - currentTokens) / refillRate);

      return {
        success: false,
        limit: capacity,
        remaining: 0,
        reset: now + timeToNextToken * 1000,
        window: Math.ceil(capacity / refillRate),
      };
    }

    // 토큰 소비
    await redis.set(
      key,
      { tokens: currentTokens - 1, lastRefill: now },
      { ex: 3600 }
    );

    return {
      success: true,
      limit: capacity,
      remaining: currentTokens - 1,
      reset: now + ((capacity - currentTokens + 1) / refillRate) * 1000,
      window: Math.ceil(capacity / refillRate),
    };
  } catch (error) {
    console.error('[Token Bucket Rate Limit] Redis error:', error);

    return {
      success: true,
      limit: capacity,
      remaining: capacity,
      reset: now + 60000,
      window: 60,
    };
  }
}

/**
 * IP 주소 기반 Rate Limiting 헬퍼
 *
 * @param ip - IP 주소
 * @param config - Rate limit 설정
 * @returns Rate limit 결과
 */
export async function rateLimitByIP(
  ip: string,
  config: RateLimitConfig = {}
): Promise<RateLimitResult> {
  return rateLimit(`ip:${ip}`, { ...config, prefix: 'rate_limit_ip' });
}

/**
 * 사용자 ID 기반 Rate Limiting 헬퍼
 *
 * @param userId - 사용자 ID
 * @param config - Rate limit 설정
 * @returns Rate limit 결과
 */
export async function rateLimitByUser(
  userId: string,
  config: RateLimitConfig = {}
): Promise<RateLimitResult> {
  return rateLimit(`user:${userId}`, { ...config, prefix: 'rate_limit_user' });
}
