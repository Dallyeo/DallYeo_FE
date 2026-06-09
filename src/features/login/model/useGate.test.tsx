import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGate } from './useGate';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useLoginSheetStore } from './loginSheetStore';

describe('useGate.guard (BR-U1-3)', () => {
  beforeEach(() => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    useLoginSheetStore.setState({ isOpen: false, pendingAction: null });
  });

  it('비로그인 + recordsTab → false + 시트 오픈', () => {
    const { result } = renderHook(() => useGate());
    const allowed = result.current.guard('recordsTab');
    expect(allowed).toBe(false);
    expect(useLoginSheetStore.getState().isOpen).toBe(true);
    expect(useLoginSheetStore.getState().pendingAction).toBe('recordsTab');
  });

  it('비로그인 + myPageTab → true(진입 허용), 시트 안 열림', () => {
    const { result } = renderHook(() => useGate());
    expect(result.current.guard('myPageTab')).toBe(true);
    expect(useLoginSheetStore.getState().isOpen).toBe(false);
  });

  it('로그인 상태 + recordsTab → true', () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    const { result } = renderHook(() => useGate());
    expect(result.current.guard('recordsTab')).toBe(true);
    expect(useLoginSheetStore.getState().isOpen).toBe(false);
  });
});
