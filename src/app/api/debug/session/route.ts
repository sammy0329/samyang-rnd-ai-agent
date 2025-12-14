/**
 * Debug API - 현재 세션 정보 확인
 * GET /api/debug/session
 */

import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';

export async function GET() {
  const session = await getServerSession();
  const userId = session?.data?.id;

  return NextResponse.json({
    hasSession: !!session?.data,
    userId: userId || null,
    userEmail: session?.data?.email || null,
    userName: session?.data?.name || null,
    userRole: session?.data?.role || null,
    targetUserId: 'ba055e9d-8a37-4040-8c05-6cd16dd2d6bc',
    match: userId === 'ba055e9d-8a37-4040-8c05-6cd16dd2d6bc',
  });
}
