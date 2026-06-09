export function LoginErrorNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <div data-testid="login-error-notice" className="rounded-md bg-bg p-3 text-sm text-danger">
      <p>로그인에 실패했어요. 다시 시도해 주세요.</p>
      <button
        type="button"
        data-testid="login-retry-button"
        onClick={onRetry}
        className="mt-2 underline"
      >
        다시 시도
      </button>
    </div>
  );
}
