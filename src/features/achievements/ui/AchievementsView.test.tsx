import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AchievementsView } from './AchievementsView';
import { useSessionStore } from '@/shared/auth/sessionStore';

function renderView() {
  return render(
    <MemoryRouter>
      <AchievementsView />
    </MemoryRouter>,
  );
}

describe('AchievementsView (V14 placeholder)', () => {
  beforeEach(() => {
    useSessionStore.setState({ status: 'unknown', session: null });
  });

  it('비로그인: 로그인 게이트', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderView();
    expect(screen.getByTestId('achievements-login-gate')).toBeInTheDocument();
  });

  it('로그인: placeholder 안내', () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    expect(screen.getByTestId('achievements-placeholder')).toBeInTheDocument();
  });
});
