/**
 * SerpAPI 클라이언트
 * Google Videos API를 통해 TikTok/Instagram Reels 검색
 * - 숏폼 동영상 검색
 * - 플랫폼별 필터링
 * - 에러 핸들링 및 재시도
 */

import axios, { AxiosError } from 'axios';
import crypto from 'crypto';
import type {
  SerpAPIVideoResponse,
  SerpAPIShortVideo,
  SerpAPIVideoSearchFilters,
  SimplifiedSerpAPIVideo,
  SerpAPIError,
} from '@/types/serpapi';
import {
  SerpAPIQuotaExceededError,
  SerpAPIKeyMissingError,
  SerpAPINoResultsError,
} from '@/types/serpapi';

// SerpAPI 기본 설정
const SERPAPI_BASE_URL = 'https://serpapi.com/search';
const DEFAULT_MAX_RESULTS = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// API 키 가져오기
function getAPIKey(): string {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new SerpAPIKeyMissingError(
      'SERPAPI_API_KEY is not set in environment variables'
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
  // 429 (Too Many Requests), 500, 502, 503, 504는 재시도
  return status === 429 || (status >= 500 && status < 600);
}

// SerpAPI 에러 핸들링
function handleSerpAPIError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<SerpAPIError>;

    if (axiosError.response) {
      const { status, data } = axiosError.response;

      // Quota/Credit 초과 에러
      if (status === 429 || (data as SerpAPIError)?.error?.includes('credit')) {
        throw new SerpAPIQuotaExceededError(
          data.error || 'SerpAPI quota or credits exceeded'
        );
      }

      // 기타 API 에러
      throw new Error(
        `SerpAPI Error (${status}): ${data.error || 'Unknown error'}`
      );
    }

    // 네트워크 에러
    throw new Error(`Network error: ${axiosError.message}`);
  }

  // 알 수 없는 에러
  throw error instanceof Error ? error : new Error('Unknown error');
}

// URL에서 고유 ID 생성
function generateVideoId(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex').slice(0, 16);
}

// SerpAPI 숏폼 비디오를 간소화된 형식으로 변환
function simplifyShortVideo(
  video: SerpAPIShortVideo
): SimplifiedSerpAPIVideo {
  const platform =
    video.source === 'TikTok'
      ? 'TikTok'
      : video.source === 'Instagram'
        ? 'Instagram'
        : video.source === 'YouTube'
          ? 'YouTube'
          : video.source === 'Facebook'
            ? 'Facebook'
            : 'Other';

  return {
    id: generateVideoId(video.link),
    title: video.title,
    platform,
    thumbnailUrl: video.thumbnail,
    videoUrl: video.link,
    creatorName: video.profile_name,
    clipUrl: video.clip,
    position: video.position,
  };
}

/**
 * 숏폼 비디오 검색 (모든 플랫폼)
 * @param filters 검색 필터 옵션
 * @returns 검색 결과 비디오 목록
 */
export async function searchShortVideos(
  filters: SerpAPIVideoSearchFilters
): Promise<SimplifiedSerpAPIVideo[]> {
  const apiKey = getAPIKey();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const params = new URLSearchParams({
        engine: 'google_videos',
        api_key: apiKey,
        q: filters.keyword,
        device: filters.device || 'mobile', // mobile이 숏폼에 더 적합
        num: String(filters.maxResults || DEFAULT_MAX_RESULTS),
      });

      if (filters.language) params.append('hl', filters.language);
      if (filters.country) params.append('gl', filters.country);

      const response = await axios.get<SerpAPIVideoResponse>(
        `${SERPAPI_BASE_URL}?${params.toString()}`
      );

      // 디버그: 응답 구조 확인
      if (process.env.NODE_ENV === 'development') {
        console.log('[SerpAPI Debug] Response keys:', Object.keys(response.data));
        console.log('[SerpAPI Debug] short_videos count:', response.data.short_videos?.length || 0);
        console.log('[SerpAPI Debug] video_results count:', response.data.video_results?.length || 0);
      }

      // short_videos 결과가 있으면 사용, 없으면 빈 배열
      const shortVideos = response.data.short_videos || [];

      if (shortVideos.length === 0) {
        // video_results에서 숏폼으로 보이는 것들 찾기 (선택 사항)
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[SerpAPI] No short_videos found for keyword: ${filters.keyword}`
          );
          console.warn(
            `[SerpAPI] Trying video_results instead... (${response.data.video_results?.length || 0} results)`
          );
        }

        // video_results가 있으면 시도해보기
        if (response.data.video_results && response.data.video_results.length > 0) {
          console.log('[SerpAPI] Using video_results as fallback');

          // 디버그: 첫 번째 비디오 구조 확인
          if (process.env.NODE_ENV === 'development' && response.data.video_results[0]) {
            console.log('[SerpAPI Debug] First video sample:', JSON.stringify(response.data.video_results[0], null, 2));
          }

          // video_results를 short_videos 형식으로 변환
          const videoResults = response.data.video_results.slice(0, filters.maxResults || DEFAULT_MAX_RESULTS);

          return videoResults.map(video => {
            // URL에서 플랫폼 추론
            let platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook' | 'Other' = 'Other';

            if (video.link.includes('tiktok.com')) {
              platform = 'TikTok';
            } else if (video.link.includes('instagram.com')) {
              platform = 'Instagram';
            } else if (video.link.includes('youtube.com') || video.link.includes('youtu.be')) {
              platform = 'YouTube';
            } else if (video.link.includes('facebook.com')) {
              platform = 'Facebook';
            } else if (video.source) {
              // source 필드가 있으면 사용
              platform = video.source as 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook' | 'Other';
            }

            return {
              id: generateVideoId(video.link),
              title: video.title,
              platform,
              thumbnailUrl: video.thumbnail,
              videoUrl: video.link,
              creatorName: video.channel?.name,
              duration: video.duration,
              position: video.position,
            };
          }) as SimplifiedSerpAPIVideo[];
        }

        return [];
      }

      // 간소화된 형식으로 변환
      const videos = shortVideos.map(simplifyShortVideo);

      // maxResults만큼만 반환
      return videos.slice(0, filters.maxResults || DEFAULT_MAX_RESULTS);
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error('Unknown searchShortVideos error');

      // Quota 초과 에러는 재시도하지 않음
      if (lastError instanceof SerpAPIQuotaExceededError) {
        throw lastError;
      }

      // 리트라이 가능한 에러인지 확인
      if (axios.isAxiosError(error) && isRetryableError(error)) {
        if (attempt < MAX_RETRIES - 1) {
          console.warn(
            `[SerpAPI] Retry attempt ${attempt + 1}/${MAX_RETRIES} for searchShortVideos`
          );
          await delay(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
      }

      // 리트라이 불가능하거나 최대 시도 횟수 초과
      handleSerpAPIError(error);
    }
  }

  // 모든 재시도 실패
  throw lastError || new Error('Failed to search short videos after retries');
}

/**
 * TikTok 비디오만 검색
 * @param keyword 검색 키워드
 * @param maxResults 최대 결과 수
 * @param country 국가 코드 (ISO 3166-1 alpha-2, 예: KR, US, JP)
 * @param language 언어 코드 (ISO 639-1, 예: ko, en, ja)
 * @returns TikTok 비디오 목록
 */
export async function searchTikTokVideos(
  keyword: string,
  maxResults: number = DEFAULT_MAX_RESULTS,
  country?: 'KR' | 'US' | 'JP',
  language?: string
): Promise<SimplifiedSerpAPIVideo[]> {
  // 더 많은 결과를 가져온 후 필터링
  const videos = await searchShortVideos({
    keyword,
    maxResults: maxResults * 3, // 필터링 후 충분한 결과를 보장하기 위해 3배로 검색
    device: 'mobile',
    country: country,
    language: language,
  });

  // TikTok만 필터링
  const tiktokVideos = videos.filter((video) => video.platform === 'TikTok');

  // 요청한 수만큼만 반환
  return tiktokVideos.slice(0, maxResults);
}

/**
 * Instagram Reels만 검색
 * @param keyword 검색 키워드
 * @param maxResults 최대 결과 수
 * @param country 국가 코드 (ISO 3166-1 alpha-2, 예: KR, US, JP)
 * @param language 언어 코드 (ISO 639-1, 예: ko, en, ja)
 * @returns Instagram Reels 목록
 */
export async function searchInstagramReels(
  keyword: string,
  maxResults: number = DEFAULT_MAX_RESULTS,
  country?: 'KR' | 'US' | 'JP',
  language?: string
): Promise<SimplifiedSerpAPIVideo[]> {
  // 더 많은 결과를 가져온 후 필터링
  const videos = await searchShortVideos({
    keyword,
    maxResults: maxResults * 3,
    device: 'mobile',
    country: country,
    language: language,
  });

  // Instagram만 필터링
  const instagramVideos = videos.filter(
    (video) => video.platform === 'Instagram'
  );

  // 요청한 수만큼만 반환
  return instagramVideos.slice(0, maxResults);
}

/**
 * TikTok + Instagram Reels 검색 (두 플랫폼 모두)
 * @param keyword 검색 키워드
 * @param maxResults 최대 결과 수
 * @returns TikTok + Instagram 비디오 목록
 */
export async function searchTikTokAndInstagram(
  keyword: string,
  maxResults: number = DEFAULT_MAX_RESULTS
): Promise<SimplifiedSerpAPIVideo[]> {
  const videos = await searchShortVideos({
    keyword,
    maxResults: maxResults * 2,
    device: 'mobile',
  });

  // TikTok 또는 Instagram만 필터링
  const socialVideos = videos.filter(
    (video) => video.platform === 'TikTok' || video.platform === 'Instagram'
  );

  return socialVideos.slice(0, maxResults);
}

/**
 * 모든 플랫폼의 숏폼 검색 (TikTok, Instagram, YouTube Shorts 등)
 * @param keyword 검색 키워드
 * @param maxResults 최대 결과 수
 * @returns 모든 플랫폼 비디오 목록
 */
export async function searchAllShortVideos(
  keyword: string,
  maxResults: number = DEFAULT_MAX_RESULTS
): Promise<SimplifiedSerpAPIVideo[]> {
  return searchShortVideos({
    keyword,
    maxResults,
    device: 'mobile',
  });
}
