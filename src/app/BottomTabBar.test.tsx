import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BottomTabBar } from './BottomTabBar';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useLoginSheetStore } from '@/features/login/model/loginSheetStore';

function renderBar() {
  return render(
    <MemoryRouter>
      <BottomTabBar />
    </MemoryRouter>,
  );
}

describe('BottomTabBar 게이트 (V02-S2)', () => {
  beforeEach(() => {
    useLoginSheetStore.setState({ isOpen: false, pendingAction: null });
  });

  it('비로그인: 기록 탭 클릭 → 로그인 시트 오픈', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderBar();
    fireEvent.click(screen.getByTestId('tab-records'));
    expect(useLoginSheetStore.getState().isOpen).toBe(true);
    expect(useLoginSheetStore.getState().pendingAction).toBe('recordsTab');
  });

  it('로그인: 기록 탭 클릭 → 시트 안 열림', () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderBar();
    fireEvent.click(screen.getByTestId('tab-records'));
    expect(useLoginSheetStore.getState().isOpen).toBe(false);
  });

  it('메인/마이페이지 탭 노출', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderBar();
    expect(screen.getByTestId('tab-main')).toBeInTheDocument();
    expect(screen.getByTestId('tab-mypage')).toBeInTheDocument();
  });
});
