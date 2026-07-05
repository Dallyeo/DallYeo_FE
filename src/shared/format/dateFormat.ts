/**
 * 한국어 날짜 표시 포맷터 (V11/V12 공용). 순수 함수. 잘못된 날짜는 빈 문자열.
 */
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toDate(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "6월 10일 금요일" (V11 리스트 카드) */
export function formatMonthDayWeekday(iso: string): string {
  const d = toDate(iso);
  if (!d) return '';
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일`;
}

/** "6월 6일 (일)" (V12 상세 헤더) */
export function formatMonthDayWeekdayShort(iso: string): string {
  const d = toDate(iso);
  if (!d) return '';
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

/** "2026.06.06" (V12 하단) */
export function formatDotDate(iso: string): string {
  const d = toDate(iso);
  if (!d) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${mm}.${dd}`;
}
