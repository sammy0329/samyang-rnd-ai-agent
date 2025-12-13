import { LoginForm } from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인 | Samyang AI Agent',
  description: 'Samyang 트렌드 분석 AI 에이전트 로그인',
};

export default function LoginPage() {
  return <LoginForm />;
}
