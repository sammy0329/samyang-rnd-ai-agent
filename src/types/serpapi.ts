/**
 * SerpAPI 타입 정의
 * Google Videos API를 통해 TikTok/Instagram Reels 검색
 */

// SerpAPI 비디오 검색 결과 응답
export interface SerpAPIVideoResponse {
  search_metadata: {
    id: string;
    status: string;
    created_at: string;
    processed_at: string;
    google_url: string;
    raw_html_file: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q: string;
    google_domain?: string;
    hl?: string;
    gl?: string;
    device?: string;
  };
  search_information: {
    query_displayed: string;
    total_results?: number;
    time_taken_displayed?: number;
  };
  video_results?: SerpAPIVideoResult[];
  short_videos?: SerpAPIShortVideo[];
}

// 일반 비디오 결과
export interface SerpAPIVideoResult {
  position: number;
  title: string;
  link: string;
  displayed_link: string;
  thumbnail: string;
  duration?: string;
  source?: string;
  date?: string;
  channel?: {
    name: string;
    link?: string;
    thumbnail?: string;
  };
}

// 숏폼 비디오 결과
export interface SerpAPIShortVideo {
  position: number;
  title: string;
  source: 'TikTok' | 'YouTube' | 'Instagram' | 'Facebook' | string;
  extensions?: string[];
  profile_name?: string;
  clip?: string; // 비디오 미리보기 URL
  thumbnail: string;
  link: string;
}

// 검색 필터 옵션
export interface SerpAPIVideoSearchFilters {
  keyword: string;
  maxResults?: number; // 기본값: 10
  language?: string; // ISO 639-1 (예: ko, en)
  country?: string; // ISO 3166-1 alpha-2 (예: KR, US)
  device?: 'desktop' | 'mobile'; // mobile이 숏폼에 더 적합
}

// 간소화된 비디오 정보 (우리 앱에서 사용)
export interface SimplifiedSerpAPIVideo {
  id: string; // link의 해시값
  title: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook' | 'Other';
  thumbnailUrl: string;
  videoUrl: string;
  creatorName?: string;
  duration?: string;
  clipUrl?: string; // 미리보기 비디오 URL
  position: number;
}

// SerpAPI 에러 응답
export interface SerpAPIError {
  error: string;
}

// Quota/Credit 관련 에러
export class SerpAPIQuotaExceededError extends Error {
  constructor(message: string = 'SerpAPI quota or credits exceeded') {
    super(message);
    this.name = 'SerpAPIQuotaExceededError';
  }
}

// API 키 없음 에러
export class SerpAPIKeyMissingError extends Error {
  constructor(message: string = 'SerpAPI key is missing') {
    super(message);
    this.name = 'SerpAPIKeyMissingError';
  }
}

// 검색 결과 없음 에러
export class SerpAPINoResultsError extends Error {
  constructor(keyword: string) {
    super(`No results found for keyword: ${keyword}`);
    this.name = 'SerpAPINoResultsError';
  }
}
