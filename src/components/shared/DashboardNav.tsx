'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, type AuthUser } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';

interface DashboardNavProps {
  user: AuthUser;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (!error) {
      router.push('/login');
      router.refresh();
    } else {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Samyang AI Agent
            </Link>

            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                대시보드
              </Link>
              <Link
                href="/trends"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                트렌드 분석
              </Link>
              <Link
                href="/creators"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                크리에이터
              </Link>
              <Link
                href="/content"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                콘텐츠 아이디어
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-500">안녕하세요, </span>
              <span className="font-medium text-gray-900">{user.name || user.email}</span>
              {user.role === 'admin' && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  Admin
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
