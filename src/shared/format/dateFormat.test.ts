import { describe, it, expect } from 'vitest';
import {
  formatMonthDayWeekday,
  formatMonthDayWeekdayShort,
  formatDotDate,
} from './dateFormat';

// 09:00Z는 오프셋 -9~+14 전 구간에서 같은 날짜 → 날짜/포맷 안정적
const iso = '2026-06-10T09:00:00Z';

describe('dateFormat', () => {
  it('formatMonthDayWeekday: "6월 10일 X요일" 형태', () => {
    expect(formatMonthDayWeekday(iso)).toMatch(/^6월 10일 [일월화수목금토]요일$/);
  });

  it('formatMonthDayWeekdayShort: "6월 10일 (X)" 형태', () => {
    expect(formatMonthDayWeekdayShort(iso)).toMatch(/^6월 10일 \([일월화수목금토]\)$/);
  });

  it('formatDotDate: YYYY.MM.DD', () => {
    expect(formatDotDate(iso)).toBe('2026.06.10');
  });

  it('잘못된 날짜 → 빈 문자열', () => {
    expect(formatMonthDayWeekday('nope')).toBe('');
    expect(formatDotDate('')).toBe('');
  });
});
