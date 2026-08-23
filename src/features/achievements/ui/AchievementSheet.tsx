import { useRef, type PointerEvent } from 'react';
import type { Achievement } from '@/domain/types';
import badge from '@/shared/ui/images/achievement-badge.png';

/** "26.06.12" */
function formatShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${String(d.getFullYear()).slice(2)}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

/**
 * V14 업적 목록 시트.
 * 시안 2단 스냅 — 올림(`V14_업적_1`: 상단 T352 → 화면 하단 기준 522 ≈ **60dvh**) /
 * 내림(`V14_업적_2`: T723 → 151 ≈ **17dvh**, 살짝만 남김).
 * 핸들을 위/아래로 끌어 전환한다(탭으로도 토글).
 * 카드 그림자는 시안이 **컨테이너에만** `0 0 10px /0.05`(아주 옅음) — 카드마다 진한 그림자를 주면 안 된다.
 * 카드 간격은 시안 12지만 사용자 요청으로 **16**.
 */
export function AchievementSheet({
  achievements,
  raised,
  onRaisedChange,
}: {
  achievements: Achievement[];
  /** 지도 영역과 높이를 공유하므로 상위가 상태를 소유한다 */
  raised: boolean;
  onRaisedChange: (raised: boolean) => void;
}) {
  const drag = useRef<number | null>(null);

  function onPointerDown(e: PointerEvent<HTMLDivElement>): void {
    drag.current = e.clientY;
  }
  function onPointerUp(e: PointerEvent<HTMLDivElement>): void {
    const start = drag.current;
    drag.current = null;
    if (start === null) return;
    const dy = e.clientY - start;
    if (dy < -30) onRaisedChange(true);
    else if (dy > 30) onRaisedChange(false);
    else onRaisedChange(!raised); // 그냥 탭하면 토글
  }

  return (
    <section
      data-testid="achievement-sheet"
      aria-label="업적 목록"
      className="absolute inset-x-0 bottom-0 z-10 flex flex-col rounded-t-lg bg-white shadow-[0_-4px_4px_rgba(0,0,0,0.05)] transition-[height] duration-300 ease-out"
      style={{ height: raised ? '60dvh' : '17dvh' }}
    >
      {/* 핸들 — 끌거나 탭해서 높이 전환 */}
      <div
        data-testid="achievement-sheet-handle"
        role="button"
        tabIndex={0}
        aria-label={raised ? '업적 목록 내리기' : '업적 목록 올리기'}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onRaisedChange(!raised);
        }}
        className="shrink-0 cursor-grab touch-none py-[10px] active:cursor-grabbing"
      >
        <span aria-hidden className="mx-auto block h-[5px] w-[50px] rounded-md bg-gray-300" />
      </div>

      {achievements.length === 0 ? (
        <p data-testid="achievement-empty" className="p-6 text-center text-body text-gray-disabled">
          이 지역의 업적이 아직 없어요.
        </p>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto px-4 pb-6 pt-[15px]">
          {achievements.map((a) => (
            <li
              key={a.code}
              data-testid={`achievement-${a.code}`}
              className={`flex h-20 items-center gap-2 rounded-sm bg-off-white px-[11px] shadow-[0_0_10px_rgba(0,0,0,0.05)] ${
                a.unlocked ? '' : 'opacity-40'
              }`}
            >
              <img src={badge} alt="" aria-hidden className="h-[60px] w-[60px] shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-label text-gray-700">{a.name}</span>
                <span className="truncate text-caption text-gray-700">{a.description}</span>
              </div>
              {a.unlocked && a.unlockedAt && (
                <span className="shrink-0 self-end pb-[10px] text-overline text-gray-700">
                  {formatShort(a.unlockedAt)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
