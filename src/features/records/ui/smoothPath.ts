/**
 * 값 배열 → 부드러운 SVG 곡선 path (시안 `월간` 988:2339 Vector 124).
 *
 * **단조 3차 보간**(Fritsch–Carlson)을 쓴다. 흔한 Catmull-Rom 스무딩은 골짜기에서
 * 곡선이 데이터 아래로 출렁여서 **거리 0인 날이 음수처럼 보이고 baseline을 뚫는다**.
 * 단조 보간은 데이터가 오르내리는 방향을 그대로 지켜 그런 오버슈트가 없다.
 *
 * 곡선은 모든 데이터 점을 정확히 지나므로, 호출부가 특정 지점(예: 오늘)에
 * 마커를 찍을 때 `yOf(value)`를 그대로 쓰면 된다.
 */
export function smoothPath(
  values: number[],
  xOf: (index: number) => number,
  yOf: (value: number) => number,
): string {
  const n = values.length;
  if (n === 0) return '';
  const pts = values.map((v, i) => ({ x: xOf(i), y: yOf(v) }));
  const first = pts[0]!;
  if (n === 1) return `M${r(first.x)},${r(first.y)}`;

  // 구간 기울기
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    slope.push(b.x === a.x ? 0 : (b.y - a.y) / (b.x - a.x));
  }

  // 각 점의 접선 — 방향이 바뀌는 지점(극값)은 0으로 눕혀 봉우리를 만들지 않는다
  const m: number[] = new Array(n).fill(0);
  m[0] = slope[0]!;
  m[n - 1] = slope[n - 2]!;
  for (let i = 1; i < n - 1; i++) {
    const s0 = slope[i - 1]!;
    const s1 = slope[i]!;
    m[i] = s0 * s1 <= 0 ? 0 : (s0 + s1) / 2;
  }

  // 오버슈트 제한 — 접선이 구간 기울기의 3배를 넘지 않게 눌러 준다
  for (let i = 0; i < n - 1; i++) {
    const s = slope[i]!;
    if (s === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i]! / s;
    const b = m[i + 1]! / s;
    const h = Math.hypot(a, b);
    if (h > 3) {
      m[i] = ((3 * a) / h) * s;
      m[i + 1] = ((3 * b) / h) * s;
    }
  }

  let d = `M${r(first.x)},${r(first.y)}`;
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const dx = (b.x - a.x) / 3;
    d +=
      ` C${r(a.x + dx)},${r(a.y + m[i]! * dx)}` +
      ` ${r(b.x - dx)},${r(b.y - m[i + 1]! * dx)}` +
      ` ${r(b.x)},${r(b.y)}`;
  }
  return d;
}

/** path 문자열이 불필요하게 길어지지 않게 소수 둘째 자리까지만 */
const r = (v: number): number => Math.round(v * 100) / 100;
