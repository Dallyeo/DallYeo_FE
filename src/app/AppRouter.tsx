import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { RouteErrorBoundary } from '@/app/RouteErrorBoundary';
import { RootLayout } from '@/app/RootLayout';
import { OnboardingFlow } from '@/features/onboarding/ui/OnboardingFlow';
import { MainView } from '@/features/main/ui/MainView';
import { SettingsView } from '@/features/settings/ui/SettingsView';
import { EditProfileView } from '@/features/settings/ui/EditProfileView';
import { AccountView } from '@/features/settings/ui/AccountView';
import { RunResultView } from '@/features/runResult/ui/RunResultView';
import { RecordsView } from '@/features/records/ui/RecordsView';
import { RecordDetailView } from '@/features/records/ui/RecordDetailView';
import { AchievementsView } from '@/features/achievements/ui/AchievementsView';

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
      { path: 'run-result', element: <RunResultView /> },
      { path: 'records', element: <RecordsView /> },
      { path: 'records/:recordId', element: <RecordDetailView /> },
      { path: 'achievements', element: <AchievementsView /> },
      { path: 'settings', element: <SettingsView /> },
      { path: 'settings/edit', element: <EditProfileView /> },
      { path: 'settings/account', element: <AccountView /> },
      { path: '*', element: <Navigate to="/main" replace /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
