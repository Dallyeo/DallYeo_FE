import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MyPageView } from './MyPageView';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useLoginSheetStore } from '@/features/login/model/loginSheetStore';

function renderPage() {
  return render(
    <MemoryRouter>
      <MyPageView />
    </MemoryRouter>,
  );
}

describe('MyPageView (LOGIN-S3, FR-V02-04)', () => {
  beforeEach(() => {
    useLoginSheetStore.setState({ isOpen: false, pendingAction: null });
  });

  it('비로그인: 배너 노출 + 항목 탭 시 시트 오픈', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderPage();
    expect(screen.getByTestId('login-banner')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mypage-item-profile'));
    expect(useLoginSheetStore.getState().isOpen).toBe(true);
  });

  it('로그인: 배너 숨김', () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderPage();
    expect(screen.queryByTestId('login-banner')).not.toBeInTheDocument();
  });
});
