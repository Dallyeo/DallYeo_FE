import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { isAllowed } from './gateRules';
import { authStatusArb, gateActionArb } from '@/shared/testing/arbitraries';
import type { GateAction } from '@/domain/types';

describe('gateRules — isAllowed', () => {
  it('example: 마이페이지 탭은 항상 허용, 기록 탭은 비로그인 차단', () => {
    expect(isAllowed('unauthenticated', 'myPageTab')).toBe(true);
    expect(isAllowed('unknown', 'myPageTab')).toBe(true);
    expect(isAllowed('unauthenticated', 'recordsTab')).toBe(false);
    expect(isAllowed('authenticated', 'recordsTab')).toBe(true);
    expect(isAllowed('unknown', 'myPageProfile')).toBe(false);
  });

  it('property: myPageTab은 모든 인증 상태에서 허용', () => {
    fc.assert(fc.property(authStatusArb, (s) => isAllowed(s, 'myPageTab') === true));
  });

  it('property: 비-myPageTab 액션은 authenticated에서만 허용', () => {
    const nonMyPageTab: GateAction[] = [
      'recordsTab',
      'myPageProfile',
      'myPageEditInfo',
      'myPageAccount',
      'saveRunResult',
    ];
    fc.assert(
      fc.property(authStatusArb, fc.constantFrom(...nonMyPageTab), (s, action) => {
        return isAllowed(s, action) === (s === 'authenticated');
      }),
    );
  });

  it('property: 결정표 전수 — authenticated는 모든 액션 허용', () => {
    fc.assert(fc.property(gateActionArb, (action) => isAllowed('authenticated', action) === true));
  });
});
