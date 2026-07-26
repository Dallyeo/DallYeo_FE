import { useState } from 'react';
import type { AuthProvider } from '@/domain/types';
import { BridgeError } from '@/shared/bridge';
import { useAuth } from '@/features/login/model/useAuth';
import { LoginErrorNotice } from '@/features/login/ui/LoginErrorNotice';
import Logo from '@/shared/ui/icons/DallYeo.svg?react';
import IcKakao from '@/shared/ui/icons/ic-kakao.svg?react';
import IcApple from '@/shared/ui/icons/ic-apple.svg?react';

type Phase = 'idle' | 'pending' | 'error';

/**
 * V01 로그인 진입화면 (온보딩 1단계) — 로고 + 소셜 로그인 + 게스트 시작.
 * OAuth 핸드셰이크는 네이티브가 수행(브리지 login). 성공/게스트 → 다음 단계.
 */
export function ServiceIntroStep({ onNext }: { onNext: () => void }) {
  const { login } = useAuth();
  const [phase, setPhase] = useState<Phase>('idle');

  async function handleLogin(provider: AuthProvider): Promise<void> {
    setPhase('pending');
    try {
      await login(provider);
      onNext();
    } catch (e) {
      if (e instanceof BridgeError && e.kind === 'cancelled') setPhase('idle');
      else setPhase('error');
    }
  }

  const pending = phase === 'pending';

  return (
    <section
      data-testid="onboarding-intro"
      className="flex flex-1 flex-col px-4 pb-[60px] pt-safe-top"
    >
      {/* 로고 (세로 중앙) */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <Logo aria-label="달여" className="h-6 w-auto text-green-700" />
      </div>

      {/* 하단 로그인 액션 */}
      <div className="flex flex-col gap-3">
        {phase === 'error' && <LoginErrorNotice onRetry={() => setPhase('idle')} />}

        <button
          type="button"
          data-testid="login-kakao-button"
          aria-label="카카오 로그인"
          disabled={pending}
          onClick={() => void handleLogin('kakao')}
          className="flex items-center justify-center gap-2 rounded-md bg-kakao py-4 text-label text-black disabled:opacity-40"
        >
          <IcKakao aria-hidden className="h-5 w-5" />
          카카오 로그인
        </button>

        <button
          type="button"
          data-testid="login-apple-button"
          aria-label="애플 로그인"
          disabled={pending}
          onClick={() => void handleLogin('apple')}
          className="flex items-center justify-center gap-2 rounded-md bg-gray-700 py-4 text-label text-white disabled:opacity-40"
        >
          <IcApple aria-hidden className="h-5 w-5" />
          애플 로그인
        </button>

        <button
          type="button"
          data-testid="onboarding-intro-next"
          disabled={pending}
          onClick={onNext}
          className="rounded-md bg-gray-200 py-4 text-label text-black disabled:opacity-40"
        >
          게스트로 시작
        </button>
      </div>
    </section>
  );
}
