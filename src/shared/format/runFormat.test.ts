import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { formatDuration, formatPace, formatDistanceKm, formatDistanceM } from './runFormat';

describe('runFormat', () => {
  it('formatDuration: 1시간 미만/이상', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3661)).toBe('1:01:01');
  });

  it('formatDuration: 음수/NaN → 0:00', () => {
    expect(formatDuration(-10)).toBe('0:00');
    expect(formatDuration(NaN)).toBe('0:00');
  });

  it('formatPace: 초/km → m\'ss\'\'', () => {
    expect(formatPace(495)).toBe("8'15''");
    expect(formatPace(360)).toBe("6'00''");
  });

  it('formatPace: 0 이하/NaN → placeholder', () => {
    expect(formatPace(0)).toBe("-'--''");
    expect(formatPace(NaN)).toBe("-'--''");
  });

  it('formatDistanceKm: 소수 둘째 자리', () => {
    expect(formatDistanceKm(10.234)).toBe('10.23');
    expect(formatDistanceKm(-1)).toBe('0.00');
  });

  it('formatDistanceM: m/km 경계', () => {
    expect(formatDistanceM(200)).toBe('200m');
    expect(formatDistanceM(999)).toBe('999m');
    expect(formatDistanceM(1500)).toBe('1.5km');
  });

  it('property: formatDuration은 항상 콜론 포함 문자열', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 500000 }), (s) => formatDuration(s).includes(':')),
    );
  });
});
