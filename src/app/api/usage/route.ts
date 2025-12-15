/**
 * API Usage 조회 엔드포인트
 * GET /api/usage - 사용자의 API 사용량 통계 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/server';
import {
  getUserUsageStats,
  getSystemUsageStats,
  getAPIUsage,
  getServiceUsageStats,
} from '@/lib/db/queries/api-usage';
import { API_QUOTA_LIMITS } from '@/types/api-usage';

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const { data: user, error: authError } = await getServerUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'user'; // user | system | list
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // type에 따라 다른 데이터 반환
    if (type === 'combined') {
      // 사용자 + 시스템 통계 (동시에 가져오기)
      const [userResult, systemResult] = await Promise.all([
        getUserUsageStats(user.id, startDate, endDate),
        getSystemUsageStats(startDate, endDate),
      ]);

      if (userResult.error || systemResult.error) {
        return NextResponse.json(
          {
            error:
              userResult.error?.message ||
              systemResult.error?.message ||
              'Failed to fetch usage stats',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          user: userResult.data,
          system: systemResult.data,
        },
        period: {
          startDate: startDate || 'all',
          endDate: endDate || 'now',
        },
      });
    }

    if (type === 'quota') {
      // 오늘 날짜 기준으로 YouTube, GPT 사용량 조회
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.toISOString();

      const [youtubeResult, gptResult] = await Promise.all([
        getServiceUsageStats('youtube', todayStart),
        getServiceUsageStats('gpt', todayStart),
      ]);

      if (youtubeResult.error || gptResult.error) {
        return NextResponse.json(
          {
            error:
              youtubeResult.error?.message ||
              gptResult.error?.message ||
              'Failed to fetch quota stats',
          },
          { status: 500 }
        );
      }

      const youtubeUsage = youtubeResult.data?.usage || 0;
      const gptUsage = gptResult.data?.usage || 0;

      return NextResponse.json({
        success: true,
        data: {
          youtube: {
            service: 'youtube',
            currentUsage: youtubeUsage,
            maxLimit: API_QUOTA_LIMITS.youtube.dailyQuota,
            usagePercentage: Math.min(
              (youtubeUsage / API_QUOTA_LIMITS.youtube.dailyQuota) * 100,
              100
            ),
            unit: API_QUOTA_LIMITS.youtube.unit,
            calls: youtubeResult.data?.calls || 0,
          },
          gpt: {
            service: 'gpt',
            currentUsage: gptUsage,
            maxLimit: API_QUOTA_LIMITS.gpt.dailyTokenLimit,
            usagePercentage: Math.min(
              (gptUsage / API_QUOTA_LIMITS.gpt.dailyTokenLimit) * 100,
              100
            ),
            unit: API_QUOTA_LIMITS.gpt.unit,
            calls: gptResult.data?.calls || 0,
          },
          updatedAt: new Date().toISOString(),
        },
      });
    }

    if (type === 'stats' || type === 'user') {
      // 사용자별 통계
      const { data, error } = await getUserUsageStats(
        user.id,
        startDate,
        endDate
      );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data,
        period: {
          startDate: startDate || 'all',
          endDate: endDate || 'now',
        },
      });
    }

    if (type === 'system') {
      // 전체 시스템 통계 (Admin만)
      if (user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden: Admin only' },
          { status: 403 }
        );
      }

      const { data, error } = await getSystemUsageStats(startDate, endDate);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data,
        period: {
          startDate: startDate || 'all',
          endDate: endDate || 'now',
        },
      });
    }

    if (type === 'list') {
      // 사용량 목록 조회
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const { data, error, count } = await getAPIUsage({
        user_id: user.id,
        startDate,
        endDate,
        limit,
        offset,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data,
        count,
        pagination: {
          limit,
          offset,
          hasMore: count ? offset + limit < count : false,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error in GET /api/usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
