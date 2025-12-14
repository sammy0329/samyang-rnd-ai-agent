'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, type AuthUser } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface DashboardNavProps {
  user: AuthUser;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (!error) {
      router.push('/login');
      router.refresh();
    } else {
      console.error('Sign out error:', error);
    }
  };

  const navLinks = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/trends', label: '트렌드 분석' },
    { href: '/creators', label: '크리에이터' },
    { href: '/content', label: '콘텐츠 아이디어' },
    { href: '/reports', label: '리포트' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Samyang AI Agent
            </Link>

            {/* 데스크톱 네비게이션 */}
            <div className="ml-10 hidden items-baseline space-x-4 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 데스크톱 사용자 정보 */}
          <div className="hidden items-center space-x-4 md:flex">
            <Link href="/profile" className="text-sm hover:opacity-80">
              <span className="text-gray-500">안녕하세요, </span>
              <span className="font-medium text-gray-900">{user.name || user.email}</span>
              {user.role === 'admin' && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  Admin
                </span>
              )}
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              로그아웃
            </Button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  isActive(link.href)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t px-4 py-3">
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm"
            >
              <span className="text-gray-500">안녕하세요, </span>
              <span className="font-medium text-gray-900">{user.name || user.email}</span>
              {user.role === 'admin' && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  Admin
                </span>
              )}
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="mt-3 w-full"
            >
              로그아웃
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
