/**
 * YouTube API 테스트 엔드포인트
 *
 * 사용 방법:
 * - GET /api/test/youtube?keyword=삼양&type=search
 * - GET /api/test/youtube?keyword=삼양&type=shorts
 * - GET /api/test/youtube?keyword=삼양&type=trending
 * - GET /api/test/youtube?videoId=VIDEO_ID&type=detail
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  searchVideos,
  searchShorts,
  searchTrendingShorts,
  getVideoById,
} from '@/lib/api/youtube';
import {
  YouTubeQuotaExceededError,
  YouTubeAPIKeyMissingError,
  YouTubeVideoNotFoundError,
} from '@/types/youtube';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'search';
    const keyword = searchParams.get('keyword');
    const videoId = searchParams.get('videoId');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    // 타입별 처리
    switch (type) {
      case 'search': {
        if (!keyword) {
          return NextResponse.json(
            { error: 'keyword parameter is required for search' },
            { status: 400 }
          );
        }

        const videos = await searchVideos({
          keyword,
          maxResults,
          videoDuration: 'short',
        });

        return NextResponse.json({
          success: true,
          type: 'search',
          keyword,
          count: videos.length,
          videos,
        });
      }

      case 'shorts': {
        if (!keyword) {
          return NextResponse.json(
            { error: 'keyword parameter is required for shorts' },
            { status: 400 }
          );
        }

        const shorts = await searchShorts(keyword, maxResults);

        return NextResponse.json({
          success: true,
          type: 'shorts',
          keyword,
          count: shorts.length,
          videos: shorts,
        });
      }

      case 'trending': {
        if (!keyword) {
          return NextResponse.json(
            { error: 'keyword parameter is required for trending' },
            { status: 400 }
          );
        }

        const trendingShorts = await searchTrendingShorts(keyword, maxResults);

        return NextResponse.json({
          success: true,
          type: 'trending',
          keyword,
          count: trendingShorts.length,
          videos: trendingShorts,
        });
      }

      case 'detail': {
        if (!videoId) {
          return NextResponse.json(
            { error: 'videoId parameter is required for detail' },
            { status: 400 }
          );
        }

        const video = await getVideoById(videoId);

        return NextResponse.json({
          success: true,
          type: 'detail',
          videoId,
          video,
        });
      }

      default:
        return NextResponse.json(
          {
            error: 'Invalid type parameter',
            validTypes: ['search', 'shorts', 'trending', 'detail'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[YouTube Test API Error]', error);

    // Quota 초과 에러
    if (error instanceof YouTubeQuotaExceededError) {
      return NextResponse.json(
        {
          success: false,
          error: 'YouTube API quota exceeded',
          message: error.message,
        },
        { status: 429 }
      );
    }

    // API 키 없음 에러
    if (error instanceof YouTubeAPIKeyMissingError) {
      return NextResponse.json(
        {
          success: false,
          error: 'YouTube API key is missing',
          message: error.message,
          hint: 'Please set YOUTUBE_API_KEY in your .env.local file',
        },
        { status: 500 }
      );
    }

    // 비디오 없음 에러
    if (error instanceof YouTubeVideoNotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Video not found',
          message: error.message,
        },
        { status: 404 }
      );
    }

    // 기타 에러
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
