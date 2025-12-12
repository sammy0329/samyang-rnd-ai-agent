/**
 * Creator 관련 TypeScript 타입 정의
 */

// Platform types
export type CreatorPlatform = 'tiktok' | 'instagram' | 'youtube';

// Creator 테이블 데이터 타입
export interface Creator {
  id: string;
  username: string;
  platform: CreatorPlatform;
  profile_url: string;
  follower_count: number | null;
  avg_views: number | null;
  engagement_rate: number | null;
  content_category: string | null;
  tone_manner: string | null;
  brand_fit_score: number | null;
  collaboration_history: Record<string, unknown> | null;
  risk_factors: Record<string, unknown> | null;
  analysis_data: Record<string, unknown> | null;
  last_analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Creator 생성 시 입력 데이터
export interface CreateCreatorInput {
  username: string;
  platform: CreatorPlatform;
  profile_url: string;
  follower_count?: number;
  avg_views?: number;
  engagement_rate?: number;
  content_category?: string;
  tone_manner?: string;
  brand_fit_score?: number;
  collaboration_history?: Record<string, unknown>;
  risk_factors?: Record<string, unknown>;
  analysis_data?: Record<string, unknown>;
}

// Creator 업데이트 시 입력 데이터
export interface UpdateCreatorInput {
  username?: string;
  platform?: CreatorPlatform;
  profile_url?: string;
  follower_count?: number;
  avg_views?: number;
  engagement_rate?: number;
  content_category?: string;
  tone_manner?: string;
  brand_fit_score?: number;
  collaboration_history?: Record<string, unknown>;
  risk_factors?: Record<string, unknown>;
  analysis_data?: Record<string, unknown>;
  last_analyzed_at?: string;
}

// Creator 목록 조회 필터
export interface CreatorFilters {
  username?: string;
  platform?: CreatorPlatform;
  content_category?: string;
  minFollowerCount?: number;
  minEngagementRate?: number;
  minBrandFitScore?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'follower_count' | 'engagement_rate' | 'brand_fit_score' | 'last_analyzed_at' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// API 응답 타입
export interface CreatorResponse {
  data: Creator | null;
  error: Error | null;
}

export interface CreatorsListResponse {
  data: Creator[] | null;
  error: Error | null;
  count?: number;
}
