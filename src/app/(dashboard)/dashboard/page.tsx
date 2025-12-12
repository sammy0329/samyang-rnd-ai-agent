import { getServerSession } from '@/lib/auth/supabase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '대시보드 | Samyang AI Agent',
  description: 'Samyang 트렌드 분석 AI 에이전트 대시보드',
};

export default async function DashboardPage() {
  const { data: user } = await getServerSession();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-gray-600">
          AI 기반 트렌드 분석, 크리에이터 매칭, 콘텐츠 아이디어 생성
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 트렌드 분석 카드 */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">트렌드 분석</h3>
              <p className="mt-1 text-sm text-gray-500">
                TikTok, Reels, Shorts 실시간 트렌드
              </p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/trends"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              분석 시작 →
            </a>
          </div>
        </div>

        {/* 크리에이터 매칭 카드 */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">크리에이터 매칭</h3>
              <p className="mt-1 text-sm text-gray-500">브랜드 적합도 AI 분석</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/creators"
              className="text-sm font-medium text-green-600 hover:text-green-500"
            >
              매칭 시작 →
            </a>
          </div>
        </div>

        {/* 콘텐츠 아이디어 카드 */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">콘텐츠 아이디어</h3>
              <p className="mt-1 text-sm text-gray-500">AI 기반 콘텐츠 기획</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/content"
              className="text-sm font-medium text-purple-600 hover:text-purple-500"
            >
              생성 시작 →
            </a>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900">최근 활동</h2>
        <div className="mt-4 rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-center text-gray-500">최근 활동 내역이 없습니다.</p>
        </div>
      </div>
    </div>
  );
}
