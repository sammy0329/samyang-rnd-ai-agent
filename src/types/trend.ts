/**
 * 트렌드 데이터 수집 관련 타입 정의
 */

// 플랫폼 타입
export type Platform = 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook' | 'Other';

// 통합 트렌드 비디오 데이터 (정규화된 형식)
export interface NormalizedTrendVideo {
  // 필수 필드
  id: string;
  title: string;
  platform: Platform;
  thumbnailUrl: string;
  videoUrl: string;
  publishedAt?: string; // ISO 8601
  duration?: string; // ISO 8601 또는 "MM:SS" 형식

  // 크리에이터 정보
  creatorName?: string;
  creatorId?: string;

  // 통계 정보 (플랫폼에 따라 있을 수도, 없을 수도 있음)
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;

  // 추가 메타데이터
  description?: string;
  tags?: string[];
  clipUrl?: string; // 미리보기 비디오 URL

  // 수집 메타데이터
  collectedAt: string; // 수집 시간 (ISO 8601)
  source: 'youtube-api' | 'serpapi'; // 데이터 출처
}

// 트렌드 수집 옵션
export interface TrendCollectionOptions {
  keyword: string;
  maxResults?: number; // 플랫폼당 최대 결과 수 (기본값: 10)
  platforms?: Platform[]; // 수집할 플랫폼 목록 (기본값: 모두)
  includeYouTube?: boolean; // YouTube 포함 여부 (기본값: true)
  includeTikTok?: boolean; // TikTok 포함 여부 (기본값: true)
  includeInstagram?: boolean; // Instagram 포함 여부 (기본값: true)
  country?: 'KR' | 'US' | 'JP'; // 국가 필터 (ISO 3166-1 alpha-2)
  language?: string; // 언어 코드 (ISO 639-1, 예: ko, en, ja) - 선택적 오버라이드 (기본값: country에서 자동 매핑)
  dateFilter?: {
    // 날짜 필터 (YouTube만 지원)
    publishedAfter?: string; // ISO 8601
    publishedBefore?: string; // ISO 8601
  };
}

// 트렌드 수집 결과
export interface TrendCollectionResult {
  keyword: string;
  totalVideos: number;
  videos: NormalizedTrendVideo[];
  breakdown: {
    [key in Platform]?: number; // 플랫폼별 수집 개수
  };
  collectedAt: string; // 수집 완료 시간
  errors?: Array<{
    platform: Platform;
    source: string;
    error: string;
  }>;
}

// 중복 제거 옵션
export interface DeduplicationOptions {
  byUrl?: boolean; // URL 기준 중복 제거 (기본값: true)
  byTitle?: boolean; // 제목 유사도 기준 중복 제거 (기본값: false)
  titleSimilarityThreshold?: number; // 제목 유사도 임계값 (0-1, 기본값: 0.9)
}
