'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="mx-auto max-w-2xl p-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              오류가 발생했습니다
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {this.state.error?.message || '알 수 없는 오류가 발생했습니다'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => this.setState({ hasError: false, error: undefined })}
              >
                다시 시도
              </Button>
              <Button onClick={() => (window.location.href = '/dashboard')}>
                대시보드로 이동
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export function ErrorFallback({
  error,
  onReset,
}: {
  error?: Error;
  onReset?: () => void;
}) {
  return (
    <Card className="p-8">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          오류가 발생했습니다
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {error?.message || '데이터를 불러오는 중 문제가 발생했습니다'}
        </p>
        {onReset && (
          <Button onClick={onReset} className="mt-6">
            다시 시도
          </Button>
        )}
      </div>
    </Card>
  );
}
