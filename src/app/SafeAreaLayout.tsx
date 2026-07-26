import type { ReactNode } from 'react';

/**
 * WebView safe-area 레이아웃 (NFR-WEBVIEW-01). 100dvh + safe-area inset.
 * 하단 탭바 높이만큼 콘텐츠 패딩 확보.
 * topInset=false → 상단 인셋을 화면이 직접 처리(예: V02 그린 헤더가 노치까지 채움).
 */
export function SafeAreaLayout({
  children,
  withTabBar = false,
  topInset = true,
}: {
  children: ReactNode;
  withTabBar?: boolean;
  topInset?: boolean;
}) {
  return (
    <div
      className="flex min-h-dvh flex-col bg-bg"
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
