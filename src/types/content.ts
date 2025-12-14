/**
 * Content Ideas 관련 TypeScript 타입 정의
 */

// Brand category types
export type BrandCategory = 'buldak' | 'samyang_ramen' | 'jelly';

// Tone types
export type Tone = 'fun' | 'kawaii' | 'provocative' | 'cool';

// Country types
export type Country = 'KR' | 'US' | 'JP';

// Content Ideas 테이블 데이터 타입
export interface ContentIdea {
  id: string;
  trend_id: string | null;
  title: string;
  brand_category: string | null;
  tone: string | null;
  format_type: string | null; // Challenge, Recipe, ASMR, Comedy, Review, Tutorial
  platform: string | null; // tiktok, instagram, youtube
  hook_text: string | null;
  hook_visual: string | null; // 첫 3초 비주얼 요소
  scene_structure: Record<string, unknown> | null;
  editing_format: string | null;
  music_style: string | null;
  props_needed: string[] | null;
  hashtags: string[] | null; // 추천 해시태그
  target_country: string | null;
  expected_performance: Record<string, unknown> | null;
  production_tips: string[] | null; // 제작 팁
  common_mistakes: string[] | null; // 피해야 할 실수
  generated_at: string;
  created_by: string | null;
  created_at: string;
}

// Content Idea 생성 시 입력 데이터
export interface CreateContentIdeaInput {
  trend_id?: string;
  title: string;
  brand_category?: BrandCategory;
  tone?: Tone;
  format_type?: string; // Challenge, Recipe, ASMR, Comedy, Review, Tutorial
  platform?: string; // tiktok, instagram, youtube
  hook_text?: string;
  hook_visual?: string;
  scene_structure?: Record<string, unknown>;
  editing_format?: string;
  music_style?: string;
  props_needed?: string[];
  hashtags?: string[];
  target_country?: Country;
  expected_performance?: Record<string, unknown>;
  production_tips?: string[];
  common_mistakes?: string[];
  created_by?: string;
}

// Content Idea 업데이트 시 입력 데이터
export interface UpdateContentIdeaInput {
  trend_id?: string;
  title?: string;
  brand_category?: BrandCategory;
  tone?: Tone;
  format_type?: string;
  platform?: string;
  hook_text?: string;
  hook_visual?: string;
  scene_structure?: Record<string, unknown>;
  editing_format?: string;
  music_style?: string;
  props_needed?: string[];
  hashtags?: string[];
  target_country?: Country;
  expected_performance?: Record<string, unknown>;
  production_tips?: string[];
  common_mistakes?: string[];
}

// Content Idea 목록 조회 필터
export interface ContentIdeaFilters {
  trend_id?: string;
  brand_category?: BrandCategory;
  tone?: Tone;
  target_country?: Country;
  created_by?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'generated_at' | 'created_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// API 응답 타입
export interface ContentIdeaResponse {
  data: ContentIdea | null;
  error: Error | null;
}

export interface ContentIdeasListResponse {
  data: ContentIdea[] | null;
  error: Error | null;
  count?: number;
}
