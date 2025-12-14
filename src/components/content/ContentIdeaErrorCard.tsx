'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ContentIdeaErrorCardProps {
  errorMessage?: string;
  onRetry?: () => void;
}

export function ContentIdeaErrorCard({
  errorMessage = '아이디어 생성에 실패했습니다',
  onRetry
}: ContentIdeaErrorCardProps) {
  return (
    <Card className="relative overflow-hidden border-red-200 bg-red-50 p-6">
      <div className="flex h-full flex-col items-center justify-center space-y-4 py-8">
        {/* 에러 아이콘 */}
        <div className="rounded-full bg-red-100 p-3">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* 에러 메시지 */}
        <div className="text-center">
          <h3 className="text-sm font-semibold text-red-900">생성 실패</h3>
          <p className="mt-1 text-xs text-red-700">{errorMessage}</p>
        </div>

        {/* 재시도 버튼 */}
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 bg-white text-red-700 hover:bg-red-100"
            onClick={onRetry}
          >
            <svg
              className="mr-1.5 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            다시 시도
          </Button>
        )}
      </div>
    </Card>
  );
}
