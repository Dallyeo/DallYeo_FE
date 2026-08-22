import type { ReactNode } from 'react';

/**
 * WebView safe-area 레이아웃 (NFR-WEBVIEW-01). 100dvh + safe-area inset.
 * 하단 탭바 높이만큼 콘텐츠 패딩 확보.
 * - `topInset=false` → 상단 인셋을 화면이 직접 처리(예: V02 그린 헤더가 노치까지 채움).
 * - `bgClass` → **상태바(safe-area) 영역까지 칠할 배경**. V12처럼 화면 전체가 primary인 경우 사용.
 * 화면 전체 스크롤은 global.css에서 막았고, 스크롤이 필요한 영역만 내부에서 처리한다.
 */
export function SafeAreaLayout({
  children,
  withTabBar = false,
  topInset = true,
  bgClass = 'bg-bg',
}: {
  children: ReactNode;
  withTabBar?: boolean;
  topInset?: boolean;
  bgClass?: string;
}) {
  return (
    <div
      className={`flex h-dvh flex-col overflow-hidden ${bgClass}`}
      style={{
        paddingTop: topInset ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: withTabBar
          ? 'calc(var(--tabbar-height) + env(safe-area-inset-bottom))'
          : 'env(safe-area-inset-bottom)',
      }}
    >
      {children}
    </div>
  );
}
