/**
 * Upstash Redis 클라이언트 설정
 */

import { Redis } from '@upstash/redis';

// Redis 클라이언트 인스턴스
let redisClient: Redis | null = null;

/**
 * Redis 클라이언트 가져오기 (싱글톤 패턴)
 */
export function getRedisClient(): Redis | null {
  // 환경 변수 확인
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('Upstash Redis credentials not found. Caching will be disabled.');
    return null;
  }

  // 이미 생성된 클라이언트가 있으면 재사용
  if (redisClient) {
    return redisClient;
  }

  try {
    // Redis 클라이언트 생성
    redisClient = new Redis({
      url,
      token,
    });

    return redisClient;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    return null;
  }
}

/**
 * Redis 사용 가능 여부 확인
 */
export function isRedisAvailable(): boolean {
  return getRedisClient() !== null;
}

/**
 * Redis 연결 테스트
 */
export async function testRedisConnection(): Promise<boolean> {
  const client = getRedisClient();

  if (!client) {
    return false;
  }

  try {
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return false;
  }
}
