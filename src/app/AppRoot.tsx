import { QueryClientProvider } from '@tanstack/react-query';
import { GlobalErrorBoundary } from '@/app/GlobalErrorBoundary';
import { AppRouter } from '@/app/AppRouter';
import { queryClient } from '@/shared/api/queryClient';

/**
 * 앱 루트 (U0). Provider 조립 + 전역 에러 경계.
 * 세션 부트스트랩(SessionService)과 브릿지 주입은 U1에서 점진 도입(Q3=B).
 */
export function AppRoot() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}
