'use client';

import { AuthUser } from '@/lib/auth/client';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface ProfileInfoSectionProps {
  user: AuthUser;
}

export function ProfileInfoSection({ user }: ProfileInfoSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4">
        {/* 프로필 아이콘 */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
          {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
        </div>

        {/* 사용자 정보 */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{user.name || '이름 없음'}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>

          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span className="font-medium">역할:</span>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {user.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
            <div>
              가입일: {format(new Date(user.created_at), 'yyyy년 MM월 dd일')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
