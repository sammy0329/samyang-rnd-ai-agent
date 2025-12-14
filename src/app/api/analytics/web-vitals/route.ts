/**
 * Web Vitals Analytics API
 *
 * POST /api/analytics/web-vitals
 * Collects Core Web Vitals metrics from the client
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, rating, id, timestamp, url } = body;

    // Log the metric
    logger.info('[Web Vitals] Metric received', {
      name,
      value: Math.round(value),
      rating,
      id,
      url,
      timestamp,
    });

    // TODO: Store in database or send to external analytics service
    // Example: await storeWebVital({ name, value, rating, id, url, timestamp });

    // For now, we just log it
    // In production, you might want to:
    // 1. Store in a time-series database (e.g., TimescaleDB, InfluxDB)
    // 2. Send to Vercel Analytics
    // 3. Send to Google Analytics
    // 4. Send to custom analytics platform

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('[Web Vitals] Failed to process metric', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process metric' },
      { status: 500 }
    );
  }
}
