import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, TouchEvent } from 'react';

/**
 * iOS 좌측 엣지 뒤로가기 제스처 폭. 여기서 시작한 터치는 **건드리지 않는다**
 * — CLAUDE.md 교차 규칙: 웹이 수평 스와이프를 가로채 뒤로가기를 막으면 안 된다.
 */
const EDGE_GUARD_PX = 24;
/** 세로 스크롤과 구분하는 기울기. 가로가 세로보다 이 배수 이상 커야 스와이프로 본다. */
const DIRECTION_RATIO = 1.5;
/** 방향을 판정하기 전에 필요한 최소 이동(px). 탭의 미세 흔들림을 걸러낸다. */
const DIRECTION_SLOP = 8;
/** 페이지 폭 대비 이만큼 끌면 다음 페이지로 넘어간다 (UIScrollView 페이징과 같은 기준). */
const DISTANCE_RATIO = 0.28;
/** 짧게 튕겨도 넘어가는 속도(px/ms) — 거리 기준을 못 채워도 관성으로 넘긴다. */
const FLICK_VELOCITY = 0.35;
/** 손을 뗀 뒤 제자리/옆 페이지로 붙는 시간(ms) */
const SETTLE_MS = 300;
/** iOS 스크롤 감속과 비슷한 ease-out */
const SETTLE_EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
/** 갈 곳이 없는 방향으로 끌 때의 저항 — 끝이라는 걸 손끝으로 알려준다. */
const RUBBER_BAND = 0.3;

interface Options {
  /** 현재 페이지 인덱스 (렌더된 페이지 배열 기준) */
  index: number;
  /** 렌더된 페이지 수 */
  count: number;
  /** 붙는 애니메이션이 끝난 뒤 호출 — 여기서 실제 상태/라우팅을 바꾼다 */
  onChange: (nextIndex: number) => void;
  enabled?: boolean;
}

/**
 * 가로 페이징 스와이프 (iOS `UIScrollView(isPagingEnabled)` 느낌).
 *
 * 이웃 페이지를 **미리 그려둔 트랙**을 손끝을 따라 밀고, 손을 떼면 거리/속도로 목적지를 정해
 * 감속하며 붙인다. 데이터만 갈아끼우는 방식과 달리 **옆 페이지가 실제로 밀려 들어온다**.
 * 붙는 애니메이션이 끝나는 순간 `onChange`와 위치 초기화를 **한 커밋에** 처리해
 * (트랙 배열이 새 현재 페이지 기준으로 다시 짜여도) 한 프레임의 튐이 없다.
 *
 * 세로 스크롤을 뺏지 않도록 방향을 한 번만 판정해 잠그고, 좌측 엣지는 시스템에 양보한다.
 */
export function usePagedSwipe({ index, count, onChange, enabled = true }: Options) {
  const trackRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<'horizontal' | 'vertical' | null>(null);
  /** 속도 계산용 직전 샘플 */
  const last = useRef<{ x: number; t: number }>({ x: 0, t: 0 });
  const velocity = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [drag, setDrag] = useState(0);
  /** 붙는 중인 목적지 인덱스. null이면 정지 상태 */
  const [settleTo, setSettleTo] = useState<number | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  function pageWidth(): number {
    return trackRef.current?.clientWidth || window.innerWidth || 1;
  }

  /** 목적지로 감속해 붙인다. 끝나면 (제자리가 아니면) `onChange`. */
  function settle(target: number): void {
    if (timer.current) clearTimeout(timer.current);
    setDrag(0);
    setSettleTo(target);
    timer.current = setTimeout(() => {
      timer.current = null;
      // 한 커밋에 함께 반영된다(React 자동 배칭) — 위치 초기화와 페이지 교체가 갈라지면 한 프레임 튄다
      setSettleTo(null);
      if (target !== index) onChange(target);
    }, SETTLE_MS);
  }

  function cancel(): void {
    start.current = null;
    axis.current = null;
    setDrag(0);
  }

  function onTouchStart(e: TouchEvent): void {
    start.current = null;
    axis.current = null;
    setDrag(0);
    if (!enabled || settleTo !== null) return;
    // 멀티터치(핀치 등)는 스와이프가 아니다
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (!touch || touch.clientX <= EDGE_GUARD_PX) return;
    start.current = { x: touch.clientX, y: touch.clientY };
    last.current = { x: touch.clientX, t: Date.now() };
    velocity.current = 0;
  }

  function onTouchMove(e: TouchEvent): void {
    const origin = start.current;
    if (!origin) return;
    if (e.touches.length !== 1) return cancel();
    const touch = e.touches[0];
    if (!touch) return;

    const moveX = touch.clientX - origin.x;
    const moveY = touch.clientY - origin.y;

    if (axis.current === null) {
      if (Math.abs(moveX) < DIRECTION_SLOP && Math.abs(moveY) < DIRECTION_SLOP) return;
      // 세로로 판정되면 손을 뗀다 — 스크롤은 브라우저 몫
      if (Math.abs(moveX) <= Math.abs(moveY) * DIRECTION_RATIO) return cancel();
      axis.current = 'horizontal';
    }

    const now = Date.now();
    // 손을 뗄 때의 관성 판정용 — 마지막 구간 속도만 본다.
    // 같은 ms에 두 이벤트가 오면 0으로 나눠지므로 1ms로 바닥을 깐다.
    const dt = Math.max(now - last.current.t, 1);
    velocity.current = (touch.clientX - last.current.x) / dt;
    last.current = { x: touch.clientX, t: now };

    // 손가락을 왼쪽으로 = 다음 페이지. 갈 곳이 없으면 고무줄.
    const hasTarget = moveX < 0 ? index < count - 1 : index > 0;
    setDrag(hasTarget ? moveX : moveX * RUBBER_BAND);
  }

  function onTouchEnd(): void {
    const moved = drag;
    const wasHorizontal = axis.current === 'horizontal';
    start.current = null;
    axis.current = null;
    if (!wasHorizontal) return setDrag(0);

    const flicked = Math.abs(velocity.current) > FLICK_VELOCITY && Math.abs(moved) > DIRECTION_SLOP;
    const dragged = Math.abs(moved) > pageWidth() * DISTANCE_RATIO;
    // 끈 방향과 튕긴 방향이 다르면(되돌리는 손짓) 제자리
    const sameWay = flicked ? Math.sign(velocity.current) === Math.sign(moved) : true;
    const step = (dragged || flicked) && sameWay ? (moved < 0 ? 1 : -1) : 0;
    settle(Math.min(Math.max(index + step, 0), count - 1));
  }

  const shown = settleTo ?? index;

  return {
    /** 트랙 엘리먼트에 붙인다 — 페이지 폭 측정에 쓴다 */
    trackRef,
    /** 트랙(`flex`, 자식은 `w-full shrink-0`)에 그대로 펴 넣는다 */
    trackStyle: {
      transform: `translate3d(calc(${-shown * 100}% + ${drag}px), 0, 0)`,
      transition: settleTo !== null ? `transform ${SETTLE_MS}ms ${SETTLE_EASING}` : 'none',
      willChange: 'transform',
    } satisfies CSSProperties as CSSProperties,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel: () => {
        if (axis.current === 'horizontal') return onTouchEnd();
        cancel();
      },
    },
  };
}
