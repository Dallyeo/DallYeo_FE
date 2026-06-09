import { describe, it, expect, beforeEach } from 'vitest';
import { useLoginSheetStore } from './loginSheetStore';

describe('loginSheetStore (LOGIN-S1)', () => {
  beforeEach(() => {
    useLoginSheetStore.setState({ isOpen: false, pendingAction: null });
  });

  it('open(action)이면 열림 + pendingAction 기록', () => {
    useLoginSheetStore.getState().open('recordsTab');
    expect(useLoginSheetStore.getState().isOpen).toBe(true);
    expect(useLoginSheetStore.getState().pendingAction).toBe('recordsTab');
  });

  it('재오픈 시 pendingAction 최신으로 갱신(중복 시트 없음)', () => {
    const s = useLoginSheetStore.getState();
    s.open('recordsTab');
    s.open('myPageProfile');
    expect(useLoginSheetStore.getState().pendingAction).toBe('myPageProfile');
    expect(useLoginSheetStore.getState().isOpen).toBe(true);
  });

  it('consumePendingAction은 값 반환 후 null', () => {
    useLoginSheetStore.getState().open('recordsTab');
    const consumed = useLoginSheetStore.getState().consumePendingAction();
    expect(consumed).toBe('recordsTab');
    expect(useLoginSheetStore.getState().pendingAction).toBeNull();
  });

  it('close는 닫고 pendingAction 정리', () => {
    useLoginSheetStore.getState().open('recordsTab');
    useLoginSheetStore.getState().close();
    expect(useLoginSheetStore.getState().isOpen).toBe(false);
    expect(useLoginSheetStore.getState().pendingAction).toBeNull();
  });
});
