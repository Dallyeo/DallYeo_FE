import { useRef, useState } from 'react';
import type { TouchEvent } from 'react';

/**
 * iOS 좌측 엣지 뒤로가기 제스처 폭. 여기서 시작한 터치는 **건드리지 않는다**
 * — CLAUDE.md 교차 규칙: 웹이 수평 스와이프를 가로채 뒤로가기를 막으면 안 된다.
 */
const EDGE_GUARD_PX = 24;
/** 세로 스크롤과 구분하는 기울기. 가로가 세로보다 이 배수 이상 커야 스와이프로 본다. */
const DIRECTION_RATIO = 1.5;
/** 방향을 판정하기 전에 필요한 최소 이동(px). 탭의 미세 흔들림을 걸러낸다. */
const DIRECTION_SLOP = 8;
/** 스와이프로 인정할 최소 이동(px) */
const DEFAULT_THRESHOLD = 60;
/** 갈 곳이 없는 방향으로 끌 때의 저항 — 끝이라는 걸 손끝으로 알려준다. */
const RUBBER_BAND = 0.25;

interface Options {
  /** 손가락을 왼쪽으로 → 목록의 **다음** 항목 */
  onSwipeLeft?: (() => void) | undefined;
  /** 손가락을 오른쪽으로 → 목록의 **이전** 항목 */
  onSwipeRight?: (() => void) | undefined;
  threshold?: number;
  enabled?: boolean;
}

/**
 * 가로 스와이프 감지 (V12 기록 넘기기).
 * 세로 스크롤을 뺏지 않도록 방향을 한 번만 판정해 잠그고, 좌측 엣지는 시스템에 양보한다.
 * `dx`는 끄는 동안의 이동량 — 호출부가 `translateX`로 물려 손끝을 따라오게 한다.
 */
export function useHorizontalSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = DEFAULT_THRESHOLD,
  enabled = true,
}: Options) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<'horizontal' | 'vertical' | null>(null);
  const [dx, setDx] = useState(0);

  function reset(): void {
    start.current = null;
    axis.current = null;
    setDx(0);
  }

  function onTouchStart(e: TouchEvent): void {
    reset();
    if (!enabled) return;
    // 멀티터치(핀치 등)는 스와이프가 아니다
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (!touch || touch.clientX <= EDGE_GUARD_PX) return;
    start.current = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchMove(e: TouchEvent): void {
    const origin = start.current;
    if (!origin) return;
    if (e.touches.length !== 1) return reset();
    const touch = e.touches[0];
    if (!touch) return;

    const moveX = touch.clientX - origin.x;
    const moveY = touch.clientY - origin.y;

    if (axis.current === null) {
      if (Math.abs(moveX) < DIRECTION_SLOP && Math.abs(moveY) < DIRECTION_SLOP) return;
      // 세로로 판정되면 손을 뗀다 — 스크롤은 브라우저 몫
      if (Math.abs(moveX) <= Math.abs(moveY) * DIRECTION_RATIO) return reset();
      axis.current = 'horizontal';
    }

    const hasTarget = moveX < 0 ? !!onSwipeLeft : !!onSwipeRight;
    setDx(hasTarget ? moveX : moveX * RUBBER_BAND);
  }

  function onTouchEnd(): void {
    const moved = dx;
    const wasHorizontal = axis.current === 'horizontal';
    reset();
    if (!wasHorizontal || Math.abs(moved) < threshold) return;
    if (moved < 0) onSwipeLeft?.();
    else onSwipeRight?.();
  }

  return {
    dx,
    /** 끄는 중 — 호출부가 되돌아가는 transition을 끌 때 쓴다 */
    isSwiping: dx !== 0,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel: reset,
    },
  };
}
