import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginBottomSheet } from './LoginBottomSheet';
import { __setBridgeAdapterForTest } from '@/shared/bridge';
import { createMockBridgeAdapter } from '@/shared/bridge/mockBridge';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useLoginSheetStore } from '@/features/login/model/loginSheetStore';
import { clearToken } from '@/shared/api/apiClient';

function renderSheet() {
  return render(
    <MemoryRouter>
      <LoginBottomSheet />
    </MemoryRouter>,
  );
}

describe('LoginBottomSheet (LOGIN-S2)', () => {
  beforeEach(() => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    useLoginSheetStore.setState({ isOpen: true, pendingAction: null });
    clearToken();
  });
  afterEach(() => {
    __setBridgeAdapterForTest(null);
  });

  it('Kakao/Apple 버튼만 노출(Google 없음)', () => {
    __setBridgeAdapterForTest(createMockBridgeAdapter({ loginScenario: 'success', delayMs: 1 }));
    renderSheet();
    expect(screen.getByTestId('login-kakao-button')).toBeInTheDocument();
    expect(screen.getByTestId('login-apple-button')).toBeInTheDocument();
    expect(screen.queryByTestId('login-google-button')).not.toBeInTheDocument();
  });

  it('성공: 로그인 후 인증 상태 + 시트 닫힘', async () => {
    __setBridgeAdapterForTest(createMockBridgeAdapter({ loginScenario: 'success', delayMs: 1 }));
    renderSheet();
    fireEvent.click(screen.getByTestId('login-kakao-button'));
    await waitFor(() => {
      expect(useSessionStore.getState().status).toBe('authenticated');
    });
    expect(useLoginSheetStore.getState().isOpen).toBe(false);
  });

  it('실패: 에러 안내 노출, 인증 상태 변화 없음', async () => {
    __setBridgeAdapterForTest(createMockBridgeAdapter({ loginScenario: 'fail', delayMs: 1 }));
    renderSheet();
    fireEvent.click(screen.getByTestId('login-apple-button'));
    await waitFor(() => {
      expect(screen.getByTestId('login-error-notice')).toBeInTheDocument();
    });
    expect(useSessionStore.getState().status).toBe('unauthenticated');
  });
});
