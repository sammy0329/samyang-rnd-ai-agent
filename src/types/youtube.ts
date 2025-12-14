/**
 * YouTube Data API v3 타입 정의
 */

// YouTube API 응답 기본 구조
export interface YouTubeAPIResponse<T> {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: T[];
}

// YouTube 비디오 썸네일
export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

// YouTube 비디오 검색 결과 아이템
export interface YouTubeSearchResultItem {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: YouTubeThumbnails;
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

// YouTube 비디오 상세 정보
export interface YouTubeVideoItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: YouTubeThumbnails;
    channelTitle: string;
    tags?: string[];
    categoryId: string;
    liveBroadcastContent: string;
    localized: {
      title: string;
      description: string;
    };
  };
  contentDetails: {
    duration: string; // ISO 8601 형식 (예: PT1M30S)
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    projection: string;
  };
  statistics: {
    viewCount: string;
    likeCount?: string;
    commentCount?: string;
  };
}

// 검색 필터 옵션
export interface YouTubeSearchFilters {
  keyword: string;
  maxResults?: number; // 기본값: 10, 최대: 50
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount'; // 기본값: relevance
  publishedAfter?: string; // RFC 3339 형식 (예: 2024-01-01T00:00:00Z)
  publishedBefore?: string;
  videoDuration?: 'short' | 'medium' | 'long' | 'any'; // short: <4분, medium: 4-20분, long: >20분
  videoType?: 'any' | 'episode' | 'movie';
  regionCode?: string; // ISO 3166-1 alpha-2 (예: KR, US)
  relevanceLanguage?: string; // ISO 639-1 (예: ko, en)
  pageToken?: string;
}

// 간소화된 비디오 정보 (우리 앱에서 사용)
export interface SimplifiedYouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  duration: string; // ISO 8601
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags?: string[];
  url: string; // https://youtube.com/watch?v={id}
}

// YouTube API 에러 응답
export interface YouTubeAPIError {
  error: {
    code: number;
    message: string;
    errors: Array<{
      domain: string;
      reason: string;
      message: string;
    }>;
  };
}

// Quota 초과 에러
export class YouTubeQuotaExceededError extends Error {
  constructor(message: string = 'YouTube API quota exceeded') {
    super(message);
    this.name = 'YouTubeQuotaExceededError';
  }
}

// API 키 없음 에러
export class YouTubeAPIKeyMissingError extends Error {
  constructor(message: string = 'YouTube API key is missing') {
    super(message);
    this.name = 'YouTubeAPIKeyMissingError';
  }
}

// 비디오를 찾을 수 없음 에러
export class YouTubeVideoNotFoundError extends Error {
  constructor(videoId: string) {
    super(`YouTube video not found: ${videoId}`);
    this.name = 'YouTubeVideoNotFoundError';
  }
}
