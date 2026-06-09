import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { BottomTabBar } from '@/app/BottomTabBar';

/**
 * 임시 화면 골격 (U0). 후속 단위(U1~U3)에서 실제 화면으로 대체.
 */
export function PlaceholderScreen({
  title,
  testId,
  withTabBar = true,
}: {
  title: string;
  testId: string;
  withTabBar?: boolean;
}) {
  return (
    <SafeAreaLayout withTabBar={withTabBar}>
      <main data-testid={testId} className="flex flex-1 flex-col items-center justify-center p-6">
        <h1 className="text-xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">준비 중인 화면입니다.</p>
      </main>
      {withTabBar && <BottomTabBar />}
    </SafeAreaLayout>
  );
}
