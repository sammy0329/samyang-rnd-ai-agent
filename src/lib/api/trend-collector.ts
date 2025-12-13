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
 * YouTube 비디오를 정규화된 형식으로 변환
 */
function normalizeYouTubeVideo(
  video: SimplifiedYouTubeVideo
): NormalizedTrendVideo {
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
function normalizeSerpAPIVideo(
  video: SimplifiedSerpAPIVideo
): NormalizedTrendVideo {
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
  const { byUrl = true, byTitle = false, titleSimilarityThreshold = 0.9 } =
    options;

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
        const similarity = calculateTitleSimilarity(
          normalizedTitle,
          existingTitle
        );

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

  const intersection = new Set(
    [...words1].filter((word) => words2.has(word))
  );
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
    dateFilter,
  } = options;

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

  // YouTube 데이터 수집
  if (shouldCollectPlatform('YouTube')) {
    try {
      console.log(`[TrendCollector] Collecting YouTube data for: ${keyword}`);

      let youtubeVideos: SimplifiedYouTubeVideo[];

      if (dateFilter?.publishedAfter) {
        // 날짜 필터가 있으면 searchVideos 사용 (더 많은 옵션)
        const { searchVideos } = await import('./youtube');
        youtubeVideos = await searchVideos({
          keyword,
          maxResults,
          videoDuration: 'short',
          publishedAfter: dateFilter.publishedAfter,
          publishedBefore: dateFilter.publishedBefore,
        });
      } else {
        // 날짜 필터 없으면 searchShorts 사용
        youtubeVideos = await searchYouTubeShorts(keyword, maxResults);
      }

      const normalized = youtubeVideos.map(normalizeYouTubeVideo);
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
      console.log(`[TrendCollector] Collecting TikTok data for: ${keyword}`);

      const tiktokVideos = await searchTikTokVideos(keyword, maxResults);
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
      console.log(`[TrendCollector] Collecting Instagram data for: ${keyword}`);

      const instagramVideos = await searchInstagramReels(keyword, maxResults);
      const normalized = instagramVideos.map(normalizeSerpAPIVideo);
      allVideos.push(...normalized);

      console.log(
        `[TrendCollector] Collected ${normalized.length} Instagram videos`
      );
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
