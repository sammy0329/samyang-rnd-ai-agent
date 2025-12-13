/**
 * API Usage 관련 TypeScript 타입 정의
 */

// API Usage 테이블 데이터 타입
export interface APIUsage {
  id: string;
  user_id: string | null;
  endpoint: string | null;
  method: string | null;
  tokens_used: number | null;
  cost: number | null;
  response_time_ms: number | null;
  status_code: number | null;
  created_at: string;
}

// API Usage 생성 시 입력 데이터
export interface CreateAPIUsageInput {
  user_id?: string;
  endpoint: string;
  method: string;
  tokens_used?: number;
  cost?: number;
  response_time_ms?: number;
  status_code?: number;
}

// API Usage 조회 필터
export interface APIUsageFilters {
  user_id?: string;
  endpoint?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'tokens_used' | 'cost' | 'response_time_ms';
  sortOrder?: 'asc' | 'desc';
}

// API 응답 타입
export interface APIUsageResponse {
  data: APIUsage | null;
  error: Error | null;
}

export interface APIUsageListResponse {
  data: APIUsage[] | null;
  error: Error | null;
  count?: number;
}

// 사용량 통계
export interface UsageStats {
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  avgResponseTime: number;
  successRate: number;
}

export interface UsageStatsResponse {
  data: UsageStats | null;
  error: Error | null;
}
