import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthProvider } from '@/domain/types';
import { BridgeError } from '@/shared/bridge';
import { useAuth } from '@/features/login/model/useAuth';
import { useLoginSheetStore } from '@/features/login/model/loginSheetStore';
import { ProviderButton } from './ProviderButton';
import { LoginErrorNotice } from './LoginErrorNotice';

type Phase = 'idle' | 'pending' | 'error';

const PROVIDERS: AuthProvider[] = ['kakao', 'apple'];

/**
 * 로그인 바텀시트 콘텐츠 (LOGIN-S2).
 * 성공 → 시트 닫고 pendingAction 재개(FD Q2=B). 취소 → 조용히 idle. 실패 → 에러 안내(FD Q3=A).
 */
export function LoginBottomSheet() {
  const [phase, setPhase] = useState<Phase>('idle');
  const { login } = useAuth();
  const close = useLoginSheetStore((s) => s.close);
  const consumePendingAction = useLoginSheetStore((s) => s.consumePendingAction);
  const navigate = useNavigate();

  async function handleLogin(provider: AuthProvider): Promise<void> {
    setPhase('pending');
    try {
      await login(provider);
      const action = consumePendingAction();
      close();
      // 기억한 액션 재개 (BR-U1-3). U1에서는 기록 탭만 라우팅; 나머지는 U3에서 연결.
      if (action === 'recordsTab') navigate('/records');
    } catch (e) {
      if (e instanceof BridgeError && e.kind === 'cancelled') {
        setPhase('idle'); // 취소: 조용히 유지
      } else {
        setPhase('error');
      }
    }
  }

  return (
    <div data-testid="login-bottom-sheet-content" className="flex flex-col gap-3">
      <h2 className="text-lg">로그인</h2>
      <p className="text-sm text-muted">소셜 계정으로 간편하게 시작하세요.</p>
      {PROVIDERS.map((provider) => (
        <ProviderButton
          key={provider}
          provider={provider}
          disabled={phase === 'pending'}
          onClick={handleLogin}
        />
      ))}
      {phase === 'error' && <LoginErrorNotice onRetry={() => setPhase('idle')} />}
    </div>
  );
}
