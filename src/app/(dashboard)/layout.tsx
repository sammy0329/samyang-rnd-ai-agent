import { getServerSession } from '@/lib/auth/supabase';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/shared/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 인증 확인
  const { data: user } = await getServerSession();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav user={user} />
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
