import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * 바텀시트 (NFR-WEBVIEW-04). history 엔트리로 관리 — 좌측 스와이프/뒤로가기로 닫힘.
 * 열릴 때 pushState, popstate(뒤로) 시 onClose. 코드로 닫을 때도 history 정리.
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  testId = 'bottom-sheet',
  variant = 'sheet',
  draggable = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
  /** 'sheet' = 하단 부착(기본) · 'center' = 화면 중앙 모달(코스정보 팝업 등) */
  variant?: 'sheet' | 'center';
  /** 핸들을 끌어 높이를 조절(65dvh ↔ 전체). 아래로 더 끌면 닫힘. sheet 변형에서만 유효. */
  draggable?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const dragRef = useRef<{ startY: number } | null>(null);

  // 닫힐 때 확장 상태 초기화 — 다시 열면 기본 높이부터
  useEffect(() => {
    if (!isOpen) setExpanded(false);
  }, [isOpen]);

  /**
   * 스냅: 위로 40px↑ → 전체 높이 / 아래로 40px↓ → 축소(이미 축소 상태면 닫기).
   * pointer capture 대신 window 리스너를 쓴다 — 손가락이 시트 밖으로 나가도 끝까지 추적된다.
   */
  function onHandleDown(e: React.PointerEvent<HTMLDivElement>): void {
    dragRef.current = { startY: e.clientY };

    const finish = (endY: number) => {
      const start = dragRef.current?.startY;
      dragRef.current = null;
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      if (start === undefined) return;
      const dy = endY - start;
      if (dy < -40) setExpanded(true);
      else if (dy > 40) setExpanded((prev) => (prev ? false : (onClose(), prev)));
    };
    const onUp = (ev: PointerEvent) => finish(ev.clientY);
    const onCancel = () => finish(dragRef.current?.startY ?? 0);

    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  }
  useEffect(() => {
    if (!isOpen) return;
    const state = { dallyeoSheet: true };
    window.history.pushState(state, '');
    const onPop = () => onClose();
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // 코드로 닫힌 경우(시트 unmount) 우리가 쌓은 history 엔트리 정리
      if (window.history.state?.dallyeoSheet) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isCenter = variant === 'center';
  // 시안 결과 모달 568/874 ≈ 65dvh. 위로 끌면 전체 높이까지.
  const sheetHeight = expanded ? '100dvh' : '65dvh';

  return (
    <div
      data-testid={`${testId}-overlay`}
      className={`fixed inset-0 z-40 flex bg-dim ${
        isCenter ? 'items-center justify-center px-[26px]' : 'items-end'
      }`}
      onClick={onClose}
    >
      <div
        data-testid={testId}
        role="dialog"
        aria-modal="true"
        className={
          isCenter
            ? 'w-full rounded-md bg-surface px-[25px] py-5'
            : `flex w-full flex-col rounded-t-lg bg-surface px-[17px] pt-[10px] transition-[height] duration-200 ease-out ${
                expanded ? 'rounded-t-none' : ''
              }`
        }
        style={
          isCenter
            ? undefined
            : {
                height: draggable ? sheetHeight : undefined,
                paddingBottom: 'env(safe-area-inset-bottom)',
              }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {draggable && !isCenter && (
          // 드래그 핸들 — 위로 끌면 전체 화면, 아래로 끌면 축소 후 닫힘
          <div
            data-testid={`${testId}-handle`}
            className="-mx-[17px] shrink-0 cursor-grab touch-none px-[17px] pb-2 pt-1 active:cursor-grabbing"
            onPointerDown={onHandleDown}
          >
            <span aria-hidden className="mx-auto block h-[5px] w-[50px] rounded-md bg-gray-300" />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
