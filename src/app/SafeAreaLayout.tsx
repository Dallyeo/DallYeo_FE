import type { ReactNode } from 'react';

/**
 * WebView safe-area 레이아웃 (NFR-WEBVIEW-01). 100dvh + safe-area inset.
 * 하단 탭바 높이만큼 콘텐츠 패딩 확보.
 */
export function SafeAreaLayout({
  children,
  withTabBar = false,
}: {
  children: ReactNode;
  withTabBar?: boolean;
}) {
  return (
    <div
      className="flex min-h-dvh flex-col bg-bg"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: withTabBar
          ? 'calc(var(--tabbar-height) + env(safe-area-inset-bottom))'
          : 'env(safe-area-inset-bottom)',
      }}
    >
      {children}
    </div>
  );
}
