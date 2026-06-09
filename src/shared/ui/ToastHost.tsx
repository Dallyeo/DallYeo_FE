import { useEffect } from 'react';
import { useToastStore } from './toastStore';

/** 토스트 표시 호스트. 메시지 표시 후 자동 소멸. */
export function ToastHost() {
  const message = useToastStore((s) => s.message);
  const clear = useToastStore((s) => s.clear);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(clear, 2500);
    return () => clearTimeout(timer);
  }, [message, clear]);

  if (!message) return null;
  return (
    <div
      data-testid="toast"
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-20 z-50 mx-auto w-fit rounded-md bg-text px-4 py-2 text-sm text-bg"
    >
      {message}
    </div>
  );
}
