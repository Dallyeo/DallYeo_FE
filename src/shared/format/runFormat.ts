/**
 * 러닝 통계 표시 포맷터 (V10/V11/V12 공용). 순수 함수.
 */

/** 초 → 시간 표기. 1시간 미만 "m:ss", 이상 "h:mm:ss". 음수/NaN은 0 처리. */
export function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.floor(Number.isFinite(totalSec) ? totalSec : 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** 초/km → 페이스 표기 "m'ss''". 0 이하/NaN은 "-'--''". */
export function formatPace(secPerKm: number): string {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return "-'--''";
  const total = Math.round(secPerKm);
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}'${String(sec).padStart(2, '0')}''`;
}

/** km 거리 표기(소수 둘째 자리). 음수/NaN은 0. */
export function formatDistanceKm(km: number): string {
  const v = Number.isFinite(km) && km > 0 ? km : 0;
  return v.toFixed(2);
}

/** 거리(m) 표기 — 1000m 미만 "NNNm", 이상 "N.Nkm". */
export function formatDistanceM(m: number): string {
  const v = Math.max(0, Math.round(Number.isFinite(m) ? m : 0));
  return v < 1000 ? `${v}m` : `${(v / 1000).toFixed(1)}km`;
}
