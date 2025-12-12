'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VerificationCodeInputProps {
  onSubmit: (code: string) => void;
  onResend: () => void;
  isLoading?: boolean;
  email: string;
}

export function VerificationCodeInput({
  onSubmit,
  onResend,
  isLoading = false,
  email,
}: VerificationCodeInputProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60); // 60초 = 1분
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 타이머 관리
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 코드가 모두 입력되면 자동 제출
  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === 6 && !isLoading) {
      onSubmit(fullCode);
    }
  }, [code, onSubmit, isLoading]);

  const handleChange = (index: number, value: string) => {
    // 숫자만 허용
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // 다음 입력으로 포커스 이동
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: 이전 입력으로 이동
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Enter: 전체 코드 제출
    if (e.key === 'Enter') {
      const fullCode = code.join('');
      if (fullCode.length === 6) {
        onSubmit(fullCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = () => {
    setCode(['', '', '', '', '', '']);
    setTimeLeft(60);
    inputRefs.current[0]?.focus();
    onResend();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">이메일 인증</h2>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">{email}</span>으로 전송된 6자리 인증 코드를 입력하세요
        </p>
      </div>

      {/* 인증 코드 입력 */}
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isLoading || timeLeft === 0}
            className="w-12 h-12 text-center text-lg font-semibold"
            autoFocus={index === 0}
          />
        ))}
      </div>

      {/* 타이머 */}
      <div className="text-center">
        {timeLeft > 0 ? (
          <p className="text-sm text-gray-600">
            남은 시간: <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
          </p>
        ) : (
          <p className="text-sm text-red-600 font-medium">인증 시간이 만료되었습니다</p>
        )}
      </div>

      {/* 재전송 버튼 */}
      {timeLeft === 0 && (
        <Button type="button" onClick={handleResend} className="w-full" disabled={isLoading}>
          인증 코드 재전송
        </Button>
      )}

      {/* 수동 제출 버튼 (선택사항) */}
      {timeLeft > 0 && (
        <Button
          type="button"
          onClick={() => onSubmit(code.join(''))}
          className="w-full"
          disabled={isLoading || code.join('').length !== 6}
        >
          {isLoading ? '확인 중...' : '인증하기'}
        </Button>
      )}

      <div className="text-center text-sm text-gray-500">
        <p>코드를 받지 못하셨나요?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={timeLeft > 0 || isLoading}
          className="mt-1 font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          재전송하기
        </button>
      </div>
    </div>
  );
}
