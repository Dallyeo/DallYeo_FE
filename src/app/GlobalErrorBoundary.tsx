import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * 전역 에러 경계 (P-1 1단). 앱 루트 최후방 — 화면 백지화 방지.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // 클라이언트 로깅 정책은 후속(NFR Design deferred). 개발 중 콘솔만.
    console.error('[GlobalErrorBoundary]', error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          data-testid="global-error-fallback"
          className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center"
        >
          <p className="text-lg">문제가 발생했어요.</p>
          <button
            type="button"
            data-testid="global-error-reload-button"
            onClick={this.handleReload}
            className="rounded-md bg-primary px-4 py-2 text-primary-contrast"
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
