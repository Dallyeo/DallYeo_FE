import type { CSSProperties, ReactNode } from 'react';

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
  bottomInset = true,
  bgClass = 'bg-bg',
  style,
}: {
  children: ReactNode;
  withTabBar?: boolean;
  topInset?: boolean;
  /**
   * `false` → 하단 인셋을 더하지 않는다. 시안 좌표가 **프레임 바닥(=홈 인디케이터 포함)** 기준이면
   * 여기서 또 더할 경우 이중 계산으로 버튼이 위로 뜬다(온보딩 푸터).
   */
  bottomInset?: boolean;
  bgClass?: string;
  /** `--screen-top-gap` 같은 화면별 변수 덮어쓰기용 */
  style?: CSSProperties;
}) {
  return (
    <div
      className={`flex h-dvh flex-col overflow-hidden ${bgClass}`}
      style={{
        ...style,
        // 상단 여백 = 안전영역 + 공통 갭. `topInset=false`인 화면은 내부에서 `.pt-screen`으로 직접 처리한다
        // (두 곳에서 동시에 주면 인셋이 이중 계산된다).
        paddingTop: topInset
          ? 'calc(env(safe-area-inset-top) + var(--screen-top-gap))'
          : undefined,
        paddingBottom: withTabBar
          ? 'calc(var(--tabbar-height) + env(safe-area-inset-bottom))'
          : bottomInset
            ? 'env(safe-area-inset-bottom)'
            : undefined,
      }}
    >
      {children}
    </div>
  );
}
