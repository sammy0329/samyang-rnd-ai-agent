/**
 * SerpAPI 테스트 엔드포인트
 *
 * 사용 방법:
 * - GET /api/test/serpapi?keyword=삼양&type=tiktok
 * - GET /api/test/serpapi?keyword=삼양&type=instagram
 * - GET /api/test/serpapi?keyword=삼양&type=both
 * - GET /api/test/serpapi?keyword=삼양&type=all
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  searchTikTokVideos,
  searchInstagramReels,
  searchTikTokAndInstagram,
  searchAllShortVideos,
} from '@/lib/api/serpapi';
import {
  SerpAPIQuotaExceededError,
  SerpAPIKeyMissingError,
  SerpAPINoResultsError,
} from '@/types/serpapi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    const keyword = searchParams.get('keyword');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    if (!keyword) {
      return NextResponse.json(
        { error: 'keyword parameter is required' },
        { status: 400 }
      );
    }

    // 타입별 처리
    switch (type) {
      case 'tiktok': {
        const videos = await searchTikTokVideos(keyword, maxResults);

        return NextResponse.json({
          success: true,
          type: 'tiktok',
          keyword,
          count: videos.length,
          videos,
        });
      }

      case 'instagram': {
        const videos = await searchInstagramReels(keyword, maxResults);

        return NextResponse.json({
          success: true,
          type: 'instagram',
          keyword,
          count: videos.length,
          videos,
        });
      }

      case 'both': {
        const videos = await searchTikTokAndInstagram(keyword, maxResults);

        return NextResponse.json({
          success: true,
          type: 'both',
          keyword,
          count: videos.length,
          videos,
          breakdown: {
            tiktok: videos.filter((v) => v.platform === 'TikTok').length,
            instagram: videos.filter((v) => v.platform === 'Instagram').length,
          },
        });
      }

      case 'all': {
        const videos = await searchAllShortVideos(keyword, maxResults);

        return NextResponse.json({
          success: true,
          type: 'all',
          keyword,
          count: videos.length,
          videos,
          breakdown: {
            tiktok: videos.filter((v) => v.platform === 'TikTok').length,
            instagram: videos.filter((v) => v.platform === 'Instagram').length,
            youtube: videos.filter((v) => v.platform === 'YouTube').length,
            facebook: videos.filter((v) => v.platform === 'Facebook').length,
            other: videos.filter((v) => v.platform === 'Other').length,
          },
        });
      }

      default:
        return NextResponse.json(
          {
            error: 'Invalid type parameter',
            validTypes: ['tiktok', 'instagram', 'both', 'all'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[SerpAPI Test API Error]', error);

    // Quota 초과 에러
    if (error instanceof SerpAPIQuotaExceededError) {
      return NextResponse.json(
        {
          success: false,
          error: 'SerpAPI quota or credits exceeded',
          message: error.message,
        },
        { status: 429 }
      );
    }

    // API 키 없음 에러
    if (error instanceof SerpAPIKeyMissingError) {
      return NextResponse.json(
        {
          success: false,
          error: 'SerpAPI key is missing',
          message: error.message,
          hint: 'Please set SERPAPI_API_KEY in your .env.local file',
        },
        { status: 500 }
      );
    }

    // 검색 결과 없음 에러
    if (error instanceof SerpAPINoResultsError) {
      return NextResponse.json(
        {
          success: false,
          error: 'No results found',
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
