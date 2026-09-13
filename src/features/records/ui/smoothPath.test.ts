import { describe, it, expect } from 'vitest';
import { smoothPath } from './smoothPath';

const PLOT = 154;
const xOf = (i: number) => i * 10;
const yOf = (v: number) => PLOT - v; // 값이 클수록 위로 (SVG y는 아래가 +)

/** path의 모든 좌표쌍 */
function coords(d: string): { x: number; y: number }[] {
  return [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
  }));
}

describe('smoothPath', () => {
  it('빈 배열은 빈 path', () => {
    expect(smoothPath([], xOf, yOf)).toBe('');
  });

  it('점 하나면 move만', () => {
    expect(smoothPath([5], xOf, yOf)).toBe('M0,149');
  });

  it('모든 데이터 점을 정확히 지난다 — 오늘 마커가 선에서 뜨면 안 된다', () => {
    const values = [0, 12, 3, 8, 0];
    const d = smoothPath(values, xOf, yOf);
    const pts = coords(d);
    // C 한 구간당 좌표 3개 + 시작 M 1개
    expect(pts).toHaveLength(1 + (values.length - 1) * 3);
    values.forEach((v, i) => {
      const onCurve = i === 0 ? pts[0]! : pts[i * 3]!;
      expect(onCurve.x).toBeCloseTo(xOf(i), 1);
      expect(onCurve.y).toBeCloseTo(yOf(v), 1);
    });
  });

  it('골짜기에서 baseline 아래로 출렁이지 않는다 (단조 보간)', () => {
    // 0 → 높은 봉우리 → 0: Catmull-Rom이면 골짜기가 baseline을 뚫는 패턴
    const d = smoothPath([0, 0, 20, 0, 0], xOf, yOf);
    for (const p of coords(d)) {
      expect(p.y).toBeLessThanOrEqual(PLOT + 0.01); // y가 PLOT보다 크면 = 0km 아래
    }
  });

  it('평평한 구간은 평평하게 — 기록 없는 날이 이어지면 직선', () => {
    const d = smoothPath([0, 0, 0, 0], xOf, yOf);
    for (const p of coords(d)) expect(p.y).toBeCloseTo(PLOT, 5);
  });
});
