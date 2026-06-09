import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { nextAuthStatus, type AuthEvent } from './sessionLogic';
import { authStatusArb } from '@/shared/testing/arbitraries';

const allEvents: AuthEvent[] = ['login', 'logout', 'expire', 'resolveExists', 'resolveAbsent'];

describe('sessionLogic — nextAuthStatus', () => {
  it('example: 전이표', () => {
    expect(nextAuthStatus('unknown', 'login')).toBe('authenticated');
    expect(nextAuthStatus('unknown', 'resolveAbsent')).toBe('unauthenticated');
    expect(nextAuthStatus('authenticated', 'expire')).toBe('unauthenticated');
    expect(nextAuthStatus('unauthenticated', 'resolveExists')).toBe('authenticated');
  });

  it('property: login/resolveExists는 항상 authenticated (흡수성)', () => {
    fc.assert(
      fc.property(authStatusArb, (s) => {
        return (
          nextAuthStatus(s, 'login') === 'authenticated' &&
          nextAuthStatus(s, 'resolveExists') === 'authenticated'
        );
      }),
    );
  });

  it('property: logout/expire/resolveAbsent는 항상 unauthenticated (흡수성)', () => {
    fc.assert(
      fc.property(authStatusArb, (s) => {
        return (
          nextAuthStatus(s, 'logout') === 'unauthenticated' &&
          nextAuthStatus(s, 'expire') === 'unauthenticated' &&
          nextAuthStatus(s, 'resolveAbsent') === 'unauthenticated'
        );
      }),
    );
  });

  it('property: 멱등성 — 전이 결과에 같은 이벤트 재적용 시 상태 불변', () => {
    fc.assert(
      fc.property(authStatusArb, fc.constantFrom(...allEvents), (s, e) => {
        const once = nextAuthStatus(s, e);
        const twice = nextAuthStatus(once, e);
        return once === twice;
      }),
    );
  });
});
