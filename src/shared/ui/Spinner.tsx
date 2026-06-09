/** 로딩 스피너 골격 (Lo-Fi). */
export function Spinner({ label = '불러오는 중...' }: { label?: string }) {
  return (
    <div
      data-testid="spinner"
      role="status"
      aria-live="polite"
      className="flex items-center justify-center p-6 text-muted"
    >
      {label}
    </div>
  );
}
