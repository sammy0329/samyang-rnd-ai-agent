/**
 * Trend 관련 TypeScript 타입 정의
 */

// Platform types
export type Platform = 'tiktok' | 'reels' | 'shorts';

// Country types
export type Country = 'KR' | 'US' | 'JP';

// Trend 테이블 데이터 타입
export interface Trend {
  id: string;
  keyword: string;
  platform: Platform;
  country: Country;
  format_type: string | null;
  hook_pattern: string | null;
  visual_pattern: string | null;
  music_pattern: string | null;
  viral_score: number | null;
  samyang_relevance: number | null;
  analysis_data: Record<string, unknown> | null;
  collected_at: string;
  created_at: string;
}

// Trend 생성 시 입력 데이터
export interface CreateTrendInput {
  keyword: string;
  platform: Platform;
  country?: Country;
  format_type?: string;
  hook_pattern?: string;
  visual_pattern?: string;
  music_pattern?: string;
  viral_score?: number;
  samyang_relevance?: number;
  analysis_data?: Record<string, unknown>;
}

// Trend 업데이트 시 입력 데이터
export interface UpdateTrendInput {
  keyword?: string;
  platform?: Platform;
  country?: Country;
  format_type?: string;
  hook_pattern?: string;
  visual_pattern?: string;
  music_pattern?: string;
  viral_score?: number;
  samyang_relevance?: number;
  analysis_data?: Record<string, unknown>;
}

// Trend 목록 조회 필터
export interface TrendFilters {
  keyword?: string;
  platform?: Platform;
  country?: Country;
  minViralScore?: number;
  minSamyangRelevance?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'collected_at' | 'viral_score' | 'samyang_relevance' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  userId?: string; // 사용자별 필터링
}

// API 응답 타입
export interface TrendResponse {
  data: Trend | null;
  error: Error | null;
}

export interface TrendsListResponse {
  data: Trend[] | null;
  error: Error | null;
  count?: number;
}
