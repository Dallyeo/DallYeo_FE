import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { sessionService } from '@/shared/auth/SessionService';
import { toast } from '@/shared/ui/toastStore';
import { ToastHost } from '@/shared/ui/ToastHost';
import { LoginBottomSheetHost } from '@/features/login/ui/LoginBottomSheetHost';
import { readOnboardingCompleted } from '@/features/onboarding/api/onboardingRepository';
import { useRunCompletedListener } from '@/features/runResult/model/useRunCompletedListener';

/**
 * 라우터 루트 레이아웃. 라우터 컨텍스트 안에서 SessionService를 기동하여
 * 무효화 시 navigate + toast 부수효과를 주입 (BR-U1-4, U1-P3).
 */
export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // 네이티브 'runCompleted' → 완주결과뷰 이동 (V10, D1). 실제(네이티브) 경로.
  useRunCompletedListener();

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

  // 최초 실행 시 온보딩 1회 리다이렉트 (BR-U2-1). 앱 진입 1회만 검사.
  useEffect(() => {
    if (!readOnboardingCompleted() && !location.pathname.startsWith('/onboarding')) {
      navigate('/onboarding', { replace: true });
    }
    // 마운트 시 1회만 평가 — 이후 완료 플래그가 흐름을 통제
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Outlet />
      <LoginBottomSheetHost />
      <ToastHost />
    </>
  );
}
