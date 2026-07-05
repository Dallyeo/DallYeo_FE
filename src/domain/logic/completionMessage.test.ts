import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { resolveCompletionTier, completionMessage } from './completionMessage';
import { COMPLETION_MESSAGE } from '@/domain/constants';

describe('completionMessage — resolveCompletionTier', () => {
  it('example: 100% → complete', () => {
    expect(resolveCompletionTier(100)).toBe('complete');
  });

  it('example: 50% 경계 → half (50% 이상)', () => {
    expect(resolveCompletionTier(50)).toBe('half');
  });

  it('example: 49.9% → low (50% 미만)', () => {
    expect(resolveCompletionTier(49.9)).toBe('low');
  });

  it('example: 0% → low', () => {
    expect(resolveCompletionTier(0)).toBe('low');
  });

  it('example: 티어별 스펙 정확 문구 매핑', () => {
    expect(completionMessage(100)).toBe(COMPLETION_MESSAGE.complete);
    expect(completionMessage(75)).toBe(COMPLETION_MESSAGE.half);
    expect(completionMessage(10)).toBe(COMPLETION_MESSAGE.low);
  });

  it('property: 임의 완주율에서 항상 3개 스펙 문구 중 하나 반환', () => {
    const messages: string[] = Object.values(COMPLETION_MESSAGE);
    fc.assert(
      fc.property(fc.double({ min: -1000, max: 1000, noNaN: true }), (rate) => {
        return messages.includes(completionMessage(rate));
      }),
    );
  });

  it('property: 완주율 단조성 — 높을수록 티어가 낮아지지 않음', () => {
    const order = { low: 0, half: 1, complete: 2 } as const;
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        (a, b) => {
          const lo = Math.min(a, b);
          const hi = Math.max(a, b);
          return order[resolveCompletionTier(hi)] >= order[resolveCompletionTier(lo)];
        },
      ),
    );
  });
});
