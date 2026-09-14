import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { sessionService } from '@/shared/auth/SessionService';
import { toast } from '@/shared/ui/toastStore';
import { ToastHost } from '@/shared/ui/ToastHost';
import { LoginBottomSheetHost } from '@/features/login/ui/LoginBottomSheetHost';
import { useRunCompletedListener } from '@/features/runResult/model/useRunCompletedListener';
import { useOnboardingGate } from '@/features/onboarding/model/useOnboardingGate';
import { DebugPanel } from './DebugPanel';

/**
 * 라우터 루트 레이아웃. 라우터 컨텍스트 안에서 SessionService를 기동하여
 * 무효화 시 navigate + toast 부수효과를 주입 (BR-U1-4, U1-P3).
 */
export function RootLayout() {
  const navigate = useNavigate();

  // 네이티브 'runCompleted' → 완주결과뷰 이동 (V10, D1). 실제(네이티브) 경로.
  useRunCompletedListener();

  // 온보딩 진입 판단 + 로그인 시 서버 정합화 (BR-U2-1/5).
  useOnboardingGate();

  useEffect(() => {
    sessionService.configure({
      onInvalidated: () => {
        navigate('/main');
        toast.show('로그아웃되었습니다');
      },
    });
    const stop = sessionService.start();
    return stop;
  }, [navigate]);

  return (
    <>
      <Outlet />
      <LoginBottomSheetHost />
      <ToastHost />
      {/* 실기기 진단 — 평소엔 렌더되지 않고, 두 손가락 1.2초 길게 누르기로만 켜진다 */}
      <DebugPanel />
    </>
  );
}
