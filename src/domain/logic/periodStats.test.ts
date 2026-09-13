import { describe, it, expect } from 'vitest';
import type { RunRecord } from '@/domain/types';
import {
  chartScaleMax,
  formatPeriodLabel,
  monthlyDistances,
  periodRange,
  sortByLatest,
} from './periodStats';

function record(id: string, completedAt: string, distanceKm: number): RunRecord {
  return { id, completedAt, distanceKm, durationSec: 1800, avgPaceSecPerKm: 300 };
}

describe('periodRange offset', () => {
  const now = new Date(2026, 5, 17); // 2026-06-17 (수)

  it('주간 offset은 7일씩 물러난다', () => {
    expect(periodRange('weekly', now, 0)).toEqual({ from: '2026-06-14', to: '2026-06-20' });
    expect(periodRange('weekly', now, -1)).toEqual({ from: '2026-06-07', to: '2026-06-13' });
  });

  it('월간 offset은 달 경계를 넘는다', () => {
    expect(periodRange('monthly', now, -1)).toEqual({ from: '2026-05-01', to: '2026-05-31' });
  });

  it('연간 offset은 해 경계를 넘는다', () => {
    expect(periodRange('yearly', now, -1)).toEqual({ from: '2025-01-01', to: '2025-12-31' });
  });
});

describe('formatPeriodLabel', () => {
  const now = new Date(2026, 5, 17);

  it('주간은 범위, 월간은 연·월, 연간은 연도만', () => {
    expect(formatPeriodLabel('weekly', periodRange('weekly', now))).toBe('2026년 6월 14일 ~ 20일');
    expect(formatPeriodLabel('monthly', periodRange('monthly', now))).toBe('2026년 6월');
    expect(formatPeriodLabel('yearly', periodRange('yearly', now))).toBe('2026년');
  });
});

describe('monthlyDistances', () => {
  it('12칸을 채우고 다른 해 기록은 빼놓는다', () => {
    const rows = monthlyDistances(
      [
        record('a', new Date(2026, 0, 5, 9).toISOString(), 5),
        record('b', new Date(2026, 0, 20, 9).toISOString(), 3.5),
        record('c', new Date(2026, 11, 1, 9).toISOString(), 2),
        record('d', new Date(2025, 5, 1, 9).toISOString(), 100),
      ],
      2026,
    );
    expect(rows).toHaveLength(12);
    expect(rows[0]).toEqual({ month: 1, distanceKm: 8.5 });
    expect(rows[11]).toEqual({ month: 12, distanceKm: 2 });
    expect(rows[5]).toEqual({ month: 6, distanceKm: 0 });
  });
});

describe('chartScaleMax', () => {
  it('1·2·5 계열로 올린다', () => {
    expect(chartScaleMax(0)).toBe(10); // 기록 없음 → 기본 눈금
    expect(chartScaleMax(0.4)).toBe(0.5);
    expect(chartScaleMax(7)).toBe(10);
    expect(chartScaleMax(12.3)).toBe(20);
    expect(chartScaleMax(60)).toBe(100);
  });

  it('상한은 항상 최댓값 이상 — 막대가 카드를 넘지 않는다', () => {
    for (const v of [0.01, 1, 3.3, 45, 99.9, 250]) {
      expect(chartScaleMax(v)).toBeGreaterThanOrEqual(v);
    }
  });
});

describe('sortByLatest', () => {
  it('최신순으로 정렬하고 원본은 건드리지 않는다', () => {
    const input = [
      record('mid', '2026-06-10T00:00:00Z', 1),
      record('new', '2026-06-12T00:00:00Z', 1),
      record('old', '2026-06-08T00:00:00Z', 1),
    ];
    expect(sortByLatest(input).map((r) => r.id)).toEqual(['new', 'mid', 'old']);
    expect(input.map((r) => r.id)).toEqual(['mid', 'new', 'old']);
  });
});
