import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthProvider, GateAction } from '@/domain/types';
import { BridgeError } from '@/shared/bridge';
import { useAuth } from '@/features/login/model/useAuth';
import { useLoginSheetStore } from '@/features/login/model/loginSheetStore';
import { ProviderButton } from './ProviderButton';
import { AlertDialog } from '@/shared/ui/AlertDialog';

type Phase = 'idle' | 'pending' | 'error';

const PROVIDERS: AuthProvider[] = ['kakao', 'apple'];

/** 시안 「알럿」(디자인시스템 988:2545) 고정 제목 */
const TITLE = '로그인이 필요한 서비스입니다.';

/**
 * 왜 로그인해야 하는지를 **게이트별로** 한 줄 설명한다.
 * 시트는 기록·업적·내정보·완주결과 네 갈래에서 열리는데, 문구가 하나면
 * "로그인하세요"만 반복돼 왜 막혔는지 알 수 없다.
 * `saveRunResult` 문구는 시안(988:2551) 그대로다.
 */
const REASON: Record<GateAction, string> = {
  saveRunResult: '비로그인 상태에서는 러닝 기록이 저장되지 않습니다.',
  recordsTab: '로그인하면 지금까지 달린 기록을 한눈에 모아 볼 수 있어요.',
  achievementsTab: '로그인하면 달리며 모은 업적을 확인할 수 있어요.',
  myPageTab: '로그인하면 내 정보를 관리할 수 있어요.',
  myPageProfile: '로그인하면 프로필을 설정할 수 있어요.',
  myPageEditInfo: '로그인하면 내 정보를 수정할 수 있어요.',
  myPageAccount: '로그인하면 계정을 관리할 수 있어요.',
};

const DEFAULT_REASON = '소셜 계정으로 간편하게 시작할 수 있어요.';

/**
 * 로그인 바텀시트 콘텐츠 (LOGIN-S2).
 *
 * 성공 → 시트 닫고 pendingAction 재개(FD Q2=B). 취소 → 조용히 idle. 실패 → 에러 안내(FD Q3=A).
 *
 * 구성·타이포는 디자인시스템 「알럿」(988:2545) 실측을 따른다 — 제목 17/22 SB,
 * 설명 12/20 M gray-700, 공식 브랜드 버튼(600×90 = 300×45 비율) 2개, 간격 15.
 * 다만 **중앙 모달이 아니라 바텀시트**로 띄운다(2026-09-15 사용자 결정) — 그래서 상단 핸들을 뒀다.
 *
 * ⚠️ 시안의 "다음에 할래요" 줄은 **넣지 않는다**(2026-09-15 사용자 결정).
 * 닫는 길은 이미 둘 있다 — 딤 영역 탭, 그리고 뒤로가기(BottomSheet가 history 엔트리로 처리).
 */
export function LoginBottomSheet() {
  const [phase, setPhase] = useState<Phase>('idle');
  const { login } = useAuth();
  const close = useLoginSheetStore((s) => s.close);
  const consumePendingAction = useLoginSheetStore((s) => s.consumePendingAction);
  // 소비하지 않고 읽기만 한다 — 재개용 액션은 로그인 성공 시점에 소비한다
  const pendingAction = useLoginSheetStore((s) => s.pendingAction);
  const navigate = useNavigate();

  const pending = phase === 'pending';
  const reason = (pendingAction && REASON[pendingAction]) || DEFAULT_REASON;

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
    <div
      data-testid="login-bottom-sheet-content"
      /*
        좌우: 시트 자체 패딩(17)에 9를 더해 앱 공통 거터(26)를 맞춘다.
        아래: 26을 직접 준다 — 시트가 붙이는 `env(safe-area-inset-bottom)`은 iOS에서만 값이 있어
        (안드로이드·브라우저는 0) 그것만 믿으면 마지막 줄이 바닥에 붙는다.
      */
      className="flex flex-col items-center px-[9px] pb-[26px] pt-1"
    >
      {/* 장식 핸들 — 끌 수 있는 시트가 아니므로 표시만 한다(시안 결과 모달과 같은 50×5) */}
      <span aria-hidden className="mb-6 h-[5px] w-[50px] shrink-0 rounded-md bg-gray-300" />

      <h2 className="text-center text-subheading text-gray-900">{TITLE}</h2>
      <p className="mt-[15px] text-center text-caption text-gray-700">{reason}</p>

      {/* 공식 브랜드 버튼 — 간격 15(시안 Frame 152). 진행 중에는 둘 다 잠근다 */}
      <div className="mt-7 flex w-full flex-col gap-[15px]">
        {PROVIDERS.map((provider) => (
          <ProviderButton
            key={provider}
            provider={provider}
            disabled={pending}
            onClick={handleLogin}
          />
        ))}
      </div>

      <AlertDialog
        isOpen={phase === 'error'}
        title="로그인에 실패했어요"
        description="잠시 후 다시 시도해 주세요."
        confirmLabel="다시 시도"
        testId="login-error-alert"
        onConfirm={() => setPhase('idle')}
        onClose={() => setPhase('idle')}
      />
    </div>
  );
}
