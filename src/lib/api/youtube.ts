/**
 * YouTube Data API v3 클라이언트
 * - 숏폼 동영상 검색
 * - 비디오 상세 정보 조회
 * - Quota 관리 및 에러 핸들링
 */

import axios, { AxiosError } from 'axios';
import type {
  YouTubeAPIResponse,
  YouTubeSearchResultItem,
  YouTubeVideoItem,
  YouTubeSearchFilters,
  SimplifiedYouTubeVideo,
  YouTubeAPIError,
} from '@/types/youtube';
import {
  YouTubeQuotaExceededError,
  YouTubeAPIKeyMissingError,
  YouTubeVideoNotFoundError,
} from '@/types/youtube';

// YouTube API 기본 설정
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const DEFAULT_MAX_RESULTS = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// API 키 가져오기
function getAPIKey(): string {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new YouTubeAPIKeyMissingError(
      'YOUTUBE_API_KEY is not set in environment variables'
    );
  }
  return apiKey;
}

// 지연 함수
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 리트라이 가능한 에러인지 확인
function isRetryableError(error: AxiosError): boolean {
  if (!error.response) {
    return true; // 네트워크 에러는 재시도
  }

  const status = error.response.status;
  // 500, 502, 503, 504는 재시도
  return status >= 500 && status < 600;
}

// YouTube API 에러 핸들링
function handleYouTubeError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<YouTubeAPIError>;

    if (axiosError.response) {
      const { status, data } = axiosError.response;

      // Quota 초과 에러
      if (
        status === 403 &&
        data.error?.errors?.some((e) => e.reason === 'quotaExceeded')
      ) {
        throw new YouTubeQuotaExceededError(
          data.error?.message || 'YouTube API quota exceeded'
        );
      }

      // 기타 API 에러
      throw new Error(
        `YouTube API Error (${status}): ${data.error?.message || 'Unknown error'}`
      );
    }

    // 네트워크 에러
    throw new Error(`Network error: ${axiosError.message}`);
  }

  // 알 수 없는 에러
  throw error instanceof Error ? error : new Error('Unknown error');
}

// ISO 8601 duration을 초로 변환
function parseDuration(duration: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);

  if (!matches) return 0;

  const hours = parseInt(matches[1] || '0');
  const minutes = parseInt(matches[2] || '0');
  const seconds = parseInt(matches[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

// ISO 8601 duration을 사람이 읽기 쉬운 형식으로 변환
function formatDuration(duration: string): string {
  const totalSeconds = parseDuration(duration);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 숏폼 동영상 검색
 * @param filters 검색 필터 옵션
 * @returns 검색 결과 비디오 목록
 */
export async function searchVideos(
  filters: YouTubeSearchFilters
): Promise<SimplifiedYouTubeVideo[]> {
  const apiKey = getAPIKey();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // 1. 비디오 검색
      const searchParams = new URLSearchParams({
        part: 'snippet',
        q: filters.keyword,
        type: 'video',
        maxResults: String(filters.maxResults || DEFAULT_MAX_RESULTS),
        key: apiKey,
      });

      // 선택적 필터 추가
      if (filters.order) searchParams.append('order', filters.order);
      if (filters.publishedAfter)
        searchParams.append('publishedAfter', filters.publishedAfter);
      if (filters.publishedBefore)
        searchParams.append('publishedBefore', filters.publishedBefore);
      if (filters.videoDuration)
        searchParams.append('videoDuration', filters.videoDuration);
      if (filters.videoType) searchParams.append('videoType', filters.videoType);
      if (filters.regionCode)
        searchParams.append('regionCode', filters.regionCode);
      if (filters.relevanceLanguage)
        searchParams.append('relevanceLanguage', filters.relevanceLanguage);
      if (filters.pageToken)
        searchParams.append('pageToken', filters.pageToken);

      const searchResponse = await axios.get<
        YouTubeAPIResponse<YouTubeSearchResultItem>
      >(`${YOUTUBE_API_BASE_URL}/search?${searchParams.toString()}`);

      const videoIds = searchResponse.data.items.map(
        (item) => item.id.videoId
      );

      if (videoIds.length === 0) {
        return [];
      }

      // 2. 비디오 상세 정보 조회 (통계 포함)
      const videos = await getVideoDetails(videoIds);

      return videos;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error('Unknown search error');

      // Quota 초과 에러는 재시도하지 않음
      if (lastError instanceof YouTubeQuotaExceededError) {
        throw lastError;
      }

      // 리트라이 가능한 에러인지 확인
      if (axios.isAxiosError(error) && isRetryableError(error)) {
        if (attempt < MAX_RETRIES - 1) {
          console.warn(
            `[YouTube] Retry attempt ${attempt + 1}/${MAX_RETRIES} for searchVideos`
          );
          await delay(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
      }

      // 리트라이 불가능하거나 최대 시도 횟수 초과
      handleYouTubeError(error);
    }
  }

  // 모든 재시도 실패
  throw lastError || new Error('Failed to search videos after retries');
}

/**
 * 비디오 상세 정보 조회
 * @param videoIds 비디오 ID 배열 (최대 50개)
 * @returns 비디오 상세 정보 목록
 */
export async function getVideoDetails(
  videoIds: string[]
): Promise<SimplifiedYouTubeVideo[]> {
  if (videoIds.length === 0) {
    return [];
  }

  const apiKey = getAPIKey();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const params = new URLSearchParams({
        part: 'snippet,contentDetails,statistics',
        id: videoIds.join(','),
        key: apiKey,
      });

      const response = await axios.get<YouTubeAPIResponse<YouTubeVideoItem>>(
        `${YOUTUBE_API_BASE_URL}/videos?${params.toString()}`
      );

      const videos: SimplifiedYouTubeVideo[] = response.data.items.map(
        (item) => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl:
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default?.url ||
            '',
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          publishedAt: item.snippet.publishedAt,
          duration: item.contentDetails.duration,
          viewCount: parseInt(item.statistics.viewCount || '0'),
          likeCount: parseInt(item.statistics.likeCount || '0'),
          commentCount: parseInt(item.statistics.commentCount || '0'),
          tags: item.snippet.tags,
          url: `https://youtube.com/watch?v=${item.id}`,
        })
      );

      return videos;
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error('Unknown getVideoDetails error');

      // Quota 초과 에러는 재시도하지 않음
      if (lastError instanceof YouTubeQuotaExceededError) {
        throw lastError;
      }

      // 리트라이 가능한 에러인지 확인
      if (axios.isAxiosError(error) && isRetryableError(error)) {
        if (attempt < MAX_RETRIES - 1) {
          console.warn(
            `[YouTube] Retry attempt ${attempt + 1}/${MAX_RETRIES} for getVideoDetails`
          );
          await delay(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
      }

      // 리트라이 불가능하거나 최대 시도 횟수 초과
      handleYouTubeError(error);
    }
  }

  // 모든 재시도 실패
  throw lastError || new Error('Failed to get video details after retries');
}

/**
 * 단일 비디오 상세 정보 조회
 * @param videoId 비디오 ID
 * @returns 비디오 상세 정보
 */
export async function getVideoById(
  videoId: string
): Promise<SimplifiedYouTubeVideo> {
  const videos = await getVideoDetails([videoId]);

  if (videos.length === 0) {
    throw new YouTubeVideoNotFoundError(videoId);
  }

  return videos[0];
}

/**
 * 숏폼 동영상만 검색 (60초 이하)
 * @param keyword 검색 키워드
 * @param maxResults 최대 결과 수
 * @param country 국가 코드 (ISO 3166-1 alpha-2, 예: KR, US, JP)
 * @param language 언어 코드 (ISO 639-1, 예: ko, en, ja)
 * @returns 숏폼 비디오 목록
 */
export async function searchShorts(
  keyword: string,
  maxResults: number = DEFAULT_MAX_RESULTS,
  country?: 'KR' | 'US' | 'JP',
  language?: string
): Promise<SimplifiedYouTubeVideo[]> {
  // YouTube API는 정확한 Shorts 필터가 없으므로 duration: short (< 4분) 사용
  const videos = await searchVideos({
    keyword,
    maxResults: maxResults * 2, // 필터링 후 충분한 결과를 보장하기 위해 2배로 검색
    videoDuration: 'short',
    order: 'viewCount', // 조회수 순으로 정렬
    regionCode: country,
    relevanceLanguage: language,
  });

  // 60초 이하의 동영상만 필터링
  const shorts = videos.filter((video) => {
    const durationInSeconds = parseDuration(video.duration);
    return durationInSeconds <= 60;
  });

  // 요청한 수만큼만 반환
  return shorts.slice(0, maxResults);
}

/**
 * 인기 트렌드 숏폼 검색 (최근 7일, 높은 조회수)
 * @param keyword 검색 키워드
 * @param maxResults 최대 결과 수
 * @param country 국가 코드 (ISO 3166-1 alpha-2, 예: KR, US, JP)
 * @param language 언어 코드 (ISO 639-1, 예: ko, en, ja)
 * @returns 트렌드 숏폼 비디오 목록
 */
export async function searchTrendingShorts(
  keyword: string,
  maxResults: number = DEFAULT_MAX_RESULTS,
  country?: 'KR' | 'US' | 'JP',
  language?: string
): Promise<SimplifiedYouTubeVideo[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const videos = await searchVideos({
    keyword,
    maxResults: maxResults * 2,
    videoDuration: 'short',
    order: 'viewCount',
    publishedAfter: sevenDaysAgo.toISOString(),
    regionCode: country,
    relevanceLanguage: language,
  });

  // 60초 이하의 동영상만 필터링
  const shorts = videos.filter((video) => {
    const durationInSeconds = parseDuration(video.duration);
    return durationInSeconds <= 60;
  });

  return shorts.slice(0, maxResults);
}

// 유틸리티 함수들을 export
export { parseDuration, formatDuration };
