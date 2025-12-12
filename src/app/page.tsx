import { getServerSession } from '@/lib/auth/supabase';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { data: user } = await getServerSession();

  // 로그인된 사용자는 대시보드로, 아니면 로그인 페이지로
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
