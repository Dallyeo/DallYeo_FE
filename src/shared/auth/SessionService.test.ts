import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessionService } from './SessionService';
import { useSessionStore } from './sessionStore';
import type { AppSession } from '@/domain/types';

const SESSION: AppSession = { userId: 'u1' };

describe('SessionService.invalidate — 무효화 1회 가드 (BR-U1-4)', () => {
  beforeEach(() => {
    useSessionStore.setState({ status: 'unknown', session: null });
  });

  it('authenticated에서 중복 invalidate 시 부수효과는 1회만', () => {
    const onInvalidated = vi.fn();
    sessionService.configure({ onInvalidated });
    useSessionStore.setState({ status: 'authenticated', session: SESSION });

    sessionService.invalidate('401');
    sessionService.invalidate('sessionChanged'); // 중복

    expect(useSessionStore.getState().status).toBe('unauthenticated');
    expect(onInvalidated).toHaveBeenCalledTimes(1);
  });

  it('이미 unauthenticated면 no-op', () => {
    const onInvalidated = vi.fn();
    sessionService.configure({ onInvalidated });
    useSessionStore.setState({ status: 'unauthenticated', session: null });

    sessionService.invalidate('401');

    expect(onInvalidated).not.toHaveBeenCalled();
  });

  it('applySession은 인증 상태로 전이', () => {
    sessionService.applySession(SESSION, 'tok');
    expect(useSessionStore.getState().status).toBe('authenticated');
    expect(useSessionStore.getState().session).toEqual(SESSION);
  });
});
