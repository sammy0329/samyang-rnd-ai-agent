'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-2xl p-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            오류가 발생했습니다
          </h1>
          <p className="mt-4 text-gray-600">
            {error.message || '페이지를 불러오는 중 문제가 발생했습니다'}
          </p>
          {error.digest && (
            <p className="mt-2 text-sm text-gray-500">Error ID: {error.digest}</p>
          )}
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
              대시보드로 이동
            </Button>
            <Button onClick={reset}>다시 시도</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
