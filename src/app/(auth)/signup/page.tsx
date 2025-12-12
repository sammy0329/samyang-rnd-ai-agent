import { SignupForm } from '@/components/auth/SignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회원가입 | Samyang AI Agent',
  description: 'Samyang 트렌드 분석 AI 에이전트 회원가입',
};

export default function SignupPage() {
  return <SignupForm />;
}
