import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { RouteErrorBoundary } from '@/app/RouteErrorBoundary';
import { RootLayout } from '@/app/RootLayout';
import { PlaceholderScreen } from '@/app/placeholders/PlaceholderScreen';
import { OnboardingFlow } from '@/features/onboarding/ui/OnboardingFlow';
import { MainView } from '@/features/main/ui/MainView';
import { MyPageView } from '@/features/settings/ui/MyPageView';

/**
 * 라우트 골격. RootLayout이 SessionService 기동 + 로그인 시트/토스트 호스트 포함(U1).
 * 시트/모달은 history 엔트리로 관리(NFR-WEBVIEW-04). 각 화면은 후속 단위에서 실제 구현으로 대체.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/main" replace /> },
      { path: 'onboarding', element: <OnboardingFlow /> },
      { path: 'main', element: <MainView /> },
      { path: 'records', element: <PlaceholderScreen title="기록" testId="screen-records" /> },
      {
        path: 'achievements',
        element: <PlaceholderScreen title="업적" testId="screen-achievements" />,
      },
      { path: 'mypage', element: <MyPageView /> },
      { path: '*', element: <Navigate to="/main" replace /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
