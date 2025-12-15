/**
 * 트렌드 데이터 수집 스크립트
 * - 여러 플랫폼(YouTube, TikTok, Instagram)에서 트렌드 데이터 수집
 * - 데이터 정규화 및 중복 제거
 * - 에러 핸들링
 */

import type { SimplifiedYouTubeVideo } from '@/types/youtube';
import type { SimplifiedSerpAPIVideo } from '@/types/serpapi';
import type {
  NormalizedTrendVideo,
  TrendCollectionOptions,
  TrendCollectionResult,
  DeduplicationOptions,
  Platform,
} from '@/types/trend';
import {
  searchShorts as searchYouTubeShorts,
  searchTrendingShorts as searchYouTubeTrendingShorts,
  searchVideosWithQuota,
} from './youtube';
import {
  searchTikTokVideos,
  searchInstagramReels,
  searchTikTokAndInstagram,
  searchAllShortVideos,
} from './serpapi';

// 기본 설정
const DEFAULT_MAX_RESULTS = 10;

/**
 * 국가 코드를 언어 코드로 매핑
 * @param country 국가 코드 (KR, US, JP)
 * @returns 언어 코드 (ko, en, ja) 또는 undefined
 */
function getLanguageCode(country?: 'KR' | 'US' | 'JP'): string | undefined {
  const languageMap: Record<'KR' | 'US' | 'JP', string> = {
    KR: 'ko', // 한국어
    US: 'en', // 영어
    JP: 'ja', // 일본어
  };
  return country ? languageMap[country] : undefined;
}

/**
 * YouTube 비디오를 정규화된 형식으로 변환
 */
function normalizeYouTubeVideo(video: SimplifiedYouTubeVideo): NormalizedTrendVideo {
  return {
    id: video.id,
    title: video.title,
    platform: 'YouTube',
    thumbnailUrl: video.thumbnailUrl,
    videoUrl: video.url,
    publishedAt: video.publishedAt,
    duration: video.duration,
    creatorName: video.channelTitle,
    creatorId: video.channelId,
    viewCount: video.viewCount,
    likeCount: video.likeCount,
    commentCount: video.commentCount,
    description: video.description,
    tags: video.tags,
    collectedAt: new Date().toISOString(),
    source: 'youtube-api',
  };
}

/**
 * SerpAPI 비디오를 정규화된 형식으로 변환
 */
function normalizeSerpAPIVideo(video: SimplifiedSerpAPIVideo): NormalizedTrendVideo {
  return {
    id: video.id,
    title: video.title,
    platform: video.platform as Platform,
    thumbnailUrl: video.thumbnailUrl,
    videoUrl: video.videoUrl,
    duration: video.duration,
    creatorName: video.creatorName,
    clipUrl: video.clipUrl,
    collectedAt: new Date().toISOString(),
    source: 'serpapi',
  };
}

/**
 * 비디오 중복 제거
 */
function deduplicateVideos(
  videos: NormalizedTrendVideo[],
  options: DeduplicationOptions = {}
): NormalizedTrendVideo[] {
  const { byUrl = true, byTitle = false, titleSimilarityThreshold = 0.9 } = options;

  if (!byUrl && !byTitle) {
    return videos; // 중복 제거 안 함
  }

  const seen = new Set<string>();
  const result: NormalizedTrendVideo[] = [];

  for (const video of videos) {
    let isDuplicate = false;

    // URL 기준 중복 체크
    if (byUrl) {
      const normalizedUrl = video.videoUrl.toLowerCase().trim();
      if (seen.has(normalizedUrl)) {
        isDuplicate = true;
      } else {
        seen.add(normalizedUrl);
      }
    }

    // 제목 유사도 기준 중복 체크 (간단한 구현)
    if (byTitle && !isDuplicate) {
      const normalizedTitle = video.title.toLowerCase().trim();
      for (const existingVideo of result) {
        const existingTitle = existingVideo.title.toLowerCase().trim();

        // 간단한 유사도 계산 (Jaccard similarity)
        const similarity = calculateTitleSimilarity(normalizedTitle, existingTitle);

        if (similarity >= titleSimilarityThreshold) {
          isDuplicate = true;
          break;
        }
      }
    }

    if (!isDuplicate) {
      result.push(video);
    }
  }

  return result;
}

/**
 * 제목 유사도 계산 (간단한 Jaccard similarity)
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const words1 = new Set(title1.split(/\s+/));
  const words2 = new Set(title2.split(/\s+/));

  const intersection = new Set([...words1].filter((word) => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * 트렌드 데이터 수집 (메인 함수)
 */
export async function collectTrends(
  options: TrendCollectionOptions
): Promise<TrendCollectionResult> {
  const {
    keyword,
    maxResults = DEFAULT_MAX_RESULTS,
    platforms,
    includeYouTube = true,
    includeTikTok = true,
    includeInstagram = true,
    country,
    language, // 명시적 언어 설정 (우선순위 높음)
    dateFilter,
  } = options;

  // 언어 코드 결정: 명시적 language > country 기반 자동 매핑
  const languageCode = language || getLanguageCode(country);

  const allVideos: NormalizedTrendVideo[] = [];
  const errors: Array<{
    platform: Platform;
    source: string;
    error: string;
  }> = [];

  // 플랫폼별 수집 여부 결정
  const shouldCollectPlatform = (platform: Platform): boolean => {
    if (platforms && platforms.length > 0) {
      return platforms.includes(platform);
    }

    // platforms 옵션이 없으면 include* 옵션 사용
    switch (platform) {
      case 'YouTube':
        return includeYouTube;
      case 'TikTok':
        return includeTikTok;
      case 'Instagram':
        return includeInstagram;
      default:
        return false;
    }
  };

  // Quota 추적 변수
  let youtubeQuotaUsed = 0;

  // YouTube 데이터 수집
  if (shouldCollectPlatform('YouTube')) {
    try {
      console.log(
        `[TrendCollector] Collecting YouTube data for: ${keyword}${country ? ` (country: ${country}, language: ${languageCode || 'auto'})` : ''}`
      );

      // searchVideosWithQuota를 사용해서 정확한 quota 추적
      const youtubeResult = await searchVideosWithQuota({
        keyword,
        maxResults: dateFilter?.publishedAfter ? maxResults : maxResults * 2, // shorts 필터링을 위해 2배
        videoDuration: 'short',
        publishedAfter: dateFilter?.publishedAfter,
        publishedBefore: dateFilter?.publishedBefore,
        regionCode: country,
        relevanceLanguage: languageCode,
      });

      // Quota 추적
      youtubeQuotaUsed = youtubeResult.quotaUsed;
      console.log(`[TrendCollector] YouTube API quota used: ${youtubeQuotaUsed} units`);

      const normalized = youtubeResult.data.map(normalizeYouTubeVideo);
      allVideos.push(...normalized);

      console.log(`[TrendCollector] Collected ${normalized.length} YouTube videos`);
    } catch (error) {
      console.error('[TrendCollector] YouTube collection error:', error);
      errors.push({
        platform: 'YouTube',
        source: 'youtube-api',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // TikTok 데이터 수집 (SerpAPI 사용)
  if (shouldCollectPlatform('TikTok')) {
    try {
      console.log(
        `[TrendCollector] Collecting TikTok data for: ${keyword}${country ? ` (country: ${country}, language: ${languageCode || 'auto'})` : ''}`
      );

      const tiktokVideos = await searchTikTokVideos(keyword, maxResults, country, languageCode);

      const normalized = tiktokVideos.map(normalizeSerpAPIVideo);
      allVideos.push(...normalized);

      console.log(`[TrendCollector] Collected ${normalized.length} TikTok videos`);
    } catch (error) {
      console.error('[TrendCollector] TikTok collection error:', error);
      errors.push({
        platform: 'TikTok',
        source: 'serpapi',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Instagram 데이터 수집 (SerpAPI 사용)
  if (shouldCollectPlatform('Instagram')) {
    try {
      console.log(
        `[TrendCollector] Collecting Instagram data for: ${keyword}${country ? ` (country: ${country}, language: ${languageCode || 'auto'})` : ''}`
      );

      const instagramVideos = await searchInstagramReels(
        keyword,
        maxResults,
        country,
        languageCode
      );

      const normalized = instagramVideos.map(normalizeSerpAPIVideo);
      allVideos.push(...normalized);

      console.log(`[TrendCollector] Collected ${normalized.length} Instagram videos`);
    } catch (error) {
      console.error('[TrendCollector] Instagram collection error:', error);
      errors.push({
        platform: 'Instagram',
        source: 'serpapi',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // 중복 제거
  console.log(`[TrendCollector] Deduplicating ${allVideos.length} videos...`);
  const dedupedVideos = deduplicateVideos(allVideos, { byUrl: true });
  console.log(`[TrendCollector] After deduplication: ${dedupedVideos.length} videos`);

  // 플랫폼별 분류
  const breakdown: { [key in Platform]?: number } = {};
  for (const video of dedupedVideos) {
    breakdown[video.platform] = (breakdown[video.platform] || 0) + 1;
  }

  const result: TrendCollectionResult = {
    keyword,
    totalVideos: dedupedVideos.length,
    videos: dedupedVideos,
    breakdown,
    collectedAt: new Date().toISOString(),
    quotaUsed: {
      youtube: youtubeQuotaUsed,
    },
  };

  if (errors.length > 0) {
    result.errors = errors;
  }

  return result;
}

/**
 * 트렌딩 트렌드 수집 (최근 7일, 높은 조회수)
 */
export async function collectTrendingTrends(
  keyword: string,
  maxResults: number = DEFAULT_MAX_RESULTS
): Promise<TrendCollectionResult> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return collectTrends({
    keyword,
    maxResults,
    includeYouTube: true,
    includeTikTok: true,
    includeInstagram: true,
    dateFilter: {
      publishedAfter: sevenDaysAgo.toISOString(),
    },
  });
}
