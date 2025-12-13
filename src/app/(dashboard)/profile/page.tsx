import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/server';
import { ProfileContent } from '@/components/profile/ProfileContent';

export default async function ProfilePage() {
  const { data: user } = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">프로필 설정</h1>
          <p className="mt-2 text-sm text-gray-600">
            계정 정보를 관리하고 비밀번호를 변경할 수 있습니다.
          </p>
        </div>

        <ProfileContent user={user} />
      </div>
    </div>
  );
}
