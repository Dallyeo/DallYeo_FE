import { useRouteError } from 'react-router-dom';

/**
 * 라우트별 에러 경계 (P-1 2단). 한 화면 에러가 탭바/다른 화면을 깨지 않도록 격리.
 * React Router의 errorElement로 사용.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  console.error('[RouteErrorBoundary]', error);

  return (
    <div
      data-testid="route-error-fallback"
      className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <p>이 화면을 불러오지 못했어요.</p>
      <button
        type="button"
        data-testid="route-error-retry-button"
        onClick={() => window.location.reload()}
        className="rounded-md border border-border px-4 py-2"
      >
        다시 시도
      </button>
    </div>
  );
}
