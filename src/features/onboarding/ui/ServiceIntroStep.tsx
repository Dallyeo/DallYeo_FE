import { useState } from 'react';
import type { AuthProvider } from '@/domain/types';
import { BridgeError } from '@/shared/bridge';
import { useAuth } from '@/features/login/model/useAuth';
import { LoginErrorNotice } from '@/features/login/ui/LoginErrorNotice';
import Logo from '@/shared/ui/icons/dallyeo_primary.svg?react';

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
      {/* 로고 — 시안 T272(가용영역 중앙보다 32 위). 로고 SVG는 primary 색이 내장됨 */}
      <div className="flex flex-1 flex-col items-center justify-center pb-16">
        <Logo aria-label="달여" className="h-[27px] w-auto" />
      </div>

      {/* 하단 로그인 액션 — 시안: 버튼 높이 56, 간격 20, 아이콘 없이 라벨만 중앙 */}
      <div className="flex flex-col gap-5">
        {phase === 'error' && <LoginErrorNotice onRetry={() => setPhase('idle')} />}

        <button
          type="button"
          data-testid="login-kakao-button"
          disabled={pending}
          onClick={() => void handleLogin('kakao')}
          className="h-14 rounded-md bg-kakao text-subheading text-black disabled:opacity-40"
        >
          카카오 로그인
        </button>

        <button
          type="button"
          data-testid="login-apple-button"
          disabled={pending}
          onClick={() => void handleLogin('apple')}
          className="h-14 rounded-md bg-gray-700 text-subheading text-white disabled:opacity-40"
        >
          애플 로그인
        </button>

        <button
          type="button"
          data-testid="onboarding-intro-next"
          disabled={pending}
          onClick={onNext}
          className="h-14 rounded-md bg-gray-250 text-subheading text-black disabled:opacity-40"
        >
          게스트로 시작
        </button>
      </div>
    </section>
  );
}
