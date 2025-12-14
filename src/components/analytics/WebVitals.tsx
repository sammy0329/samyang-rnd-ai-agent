'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { logger } from '@/lib/logger';

/**
 * Web Vitals Reporter Component
 *
 * Tracks Core Web Vitals and reports them:
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay)
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint)
 *
 * In production, these metrics can be sent to analytics services
 * like Vercel Analytics, Google Analytics, or custom endpoints.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    const { name, value, rating, id } = metric;

    // Log web vitals in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`[Web Vitals] ${name}`, {
        value: Math.round(value),
        rating,
        id,
      });
    }

    // In production, send to analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      // Send to custom analytics endpoint
      const url = '/api/analytics/web-vitals';

      // Use sendBeacon if available (non-blocking)
      if (navigator.sendBeacon) {
        const body = JSON.stringify({
          name,
          value,
          rating,
          id,
          timestamp: Date.now(),
          url: window.location.href,
        });
        navigator.sendBeacon(url, body);
      } else {
        // Fallback to fetch
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            value,
            rating,
            id,
            timestamp: Date.now(),
            url: window.location.href,
          }),
          keepalive: true,
        }).catch((error) => {
          logger.error('Failed to send web vitals', error);
        });
      }
    }
  });

  return null;
}

/**
 * Performance monitoring utility
 * Can be used to track custom performance metrics
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Track route changes and performance
    if (typeof window !== 'undefined' && window.performance) {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (navigationTiming) {
        const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
        const dnsTime = navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart;
        const tcpTime = navigationTiming.connectEnd - navigationTiming.connectStart;
        const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;

        logger.debug('[Performance] Page metrics', {
          pageLoadTime: Math.round(pageLoadTime),
          dnsTime: Math.round(dnsTime),
          tcpTime: Math.round(tcpTime),
          ttfb: Math.round(ttfb),
        });
      }
    }
  }, []);
}
