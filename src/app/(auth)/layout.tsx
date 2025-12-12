import { getServerSession } from '@/lib/auth/supabase';
import { redirect } from 'next/navigation';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  const { data: user } = await getServerSession();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Samyang AI Agent</h1>
          <p className="mt-2 text-sm text-gray-600">
            트렌드 분석 · 크리에이터 매칭 · 콘텐츠 아이디어 생성
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-md">{children}</div>

        <p className="mt-6 text-center text-xs text-gray-500">
          © 2025 Samyang Foods. All rights reserved.
        </p>
      </div>
    </div>
  );
}
