import type { DailyDistance, RunRecord, StatsPeriod } from '@/domain/types';

/** 기간 경계 (ISO date, YYYY-MM-DD). `GET /runs?from&to` 파라미터로 그대로 쓴다. */
export interface PeriodRange {
  from: string;
  to: string;
}

const iso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * 기간 구간 계산. 주간은 **일요일 시작**(시안 차트가 일~토).
 * offset은 과거로 이동하는 구간 수 — 전 구간 대비 증감 계산에 쓴다(-1 = 직전 구간).
 */
export function periodRange(period: StatsPeriod, now: Date, offset = 0): PeriodRange {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'weekly') {
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay() + offset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { from: iso(start), to: iso(end) };
  }
  if (period === 'monthly') {
    const start = new Date(d.getFullYear(), d.getMonth() + offset, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + offset + 1, 0);
    return { from: iso(start), to: iso(end) };
  }
  const start = new Date(d.getFullYear() + offset, 0, 1);
  const end = new Date(d.getFullYear() + offset, 11, 31);
  return { from: iso(start), to: iso(end) };
}

/** 구간 내 총 거리(km). 소수 2자리에서 반올림 — 부동소수 누적 오차 방지. */
export function totalDistanceKm(records: RunRecord[]): number {
  return Math.round(records.reduce((sum, r) => sum + r.distanceKm, 0) * 100) / 100;
}

/**
 * 주간 막대그래프용 일별 거리. 구간의 **7일을 빠짐없이** 채운다(기록 없는 날은 0).
 * 시안은 일~토 7칸 고정이라 빈 날도 자리를 차지해야 한다.
 */
export function dailyDistances(records: RunRecord[], range: PeriodRange): DailyDistance[] {
  const byDate = new Map<string, number>();
  for (const r of records) {
    // ⚠️ `completedAt`은 UTC ISO다. `.slice(0,10)`으로 자르면 KST 오전 기록이
    //    전날로 밀린다(08:30 KST = 23:30 UTC 전날). 반드시 **로컬 날짜**로 환산할 것.
    const key = iso(new Date(r.completedAt));
    byDate.set(key, (byDate.get(key) ?? 0) + r.distanceKm);
  }
  const out: DailyDistance[] = [];
  const cursor = new Date(`${range.from}T00:00:00`);
  const end = new Date(`${range.to}T00:00:00`);
  while (cursor <= end) {
    const key = iso(cursor);
    out.push({ date: key, distanceKm: Math.round((byDate.get(key) ?? 0) * 100) / 100 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

/** "2026년 6월 15일 ~ 21일" — 같은 달이면 끝 날짜는 일(日)만 표기 */
export function formatRangeLabel(range: PeriodRange): string {
  const s = new Date(`${range.from}T00:00:00`);
  const e = new Date(`${range.to}T00:00:00`);
  const head = `${s.getFullYear()}년 ${s.getMonth() + 1}월 ${s.getDate()}일`;
  const tail =
    s.getMonth() === e.getMonth()
      ? `${e.getDate()}일`
      : `${e.getMonth() + 1}월 ${e.getDate()}일`;
  return `${head} ~ ${tail}`;
}
