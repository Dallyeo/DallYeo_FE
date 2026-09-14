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

  /*
   * 시트는 기록·업적·내정보·완주결과 네 갈래에서 열린다. 제목은 시안대로 고정이지만,
   * 설명까지 하나면 "왜 막혔는지"를 알 수 없어 게이트별로 다르게 적는다.
   */
  it('제목은 고정이고, 왜 막혔는지는 게이트별로 다르게 적는다', () => {
    __setBridgeAdapterForTest(createMockBridgeAdapter({ loginScenario: 'success', delayMs: 1 }));
    const { unmount } = renderSheet();
    const content = () => screen.getByTestId('login-bottom-sheet-content').textContent ?? '';
    expect(content()).toContain('로그인이 필요한 서비스입니다.');
    const withoutAction = content();
    unmount();

    useLoginSheetStore.setState({ isOpen: true, pendingAction: 'saveRunResult' });
    renderSheet();
    expect(content()).toContain('로그인이 필요한 서비스입니다.');
    expect(content()).toContain('러닝 기록이 저장되지 않습니다');
    // 문구는 한 줄로 흘린다(줄바꿈을 넣지 않는다)
    expect(content()).not.toContain('\n');
    expect(content()).not.toBe(withoutAction);
  });

  it('로그인 중에는 두 버튼을 모두 잠근다 (네이티브 OAuth 창이 이미 떠 있다)', async () => {
    // 응답을 늦춰 pending 상태를 붙잡는다
    __setBridgeAdapterForTest(createMockBridgeAdapter({ loginScenario: 'success', delayMs: 80 }));
    renderSheet();

    fireEvent.click(screen.getByTestId('login-kakao-button'));

    await waitFor(() => expect(screen.getByTestId('login-kakao-button')).toBeDisabled());
    expect(screen.getByTestId('login-apple-button')).toBeDisabled();
  });

  /** 닫는 길은 딤 탭과 뒤로가기뿐이다 — 시안의 "다음에 할래요" 줄은 넣지 않기로 했다 */
  it('"다음에 할래요" 줄은 두지 않는다', () => {
    __setBridgeAdapterForTest(createMockBridgeAdapter({ loginScenario: 'success', delayMs: 1 }));
    renderSheet();
    expect(screen.queryByTestId('login-dismiss')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-bottom-sheet-content').textContent).not.toContain(
      '다음에 할래요',
    );
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
      expect(screen.getByTestId('login-error-alert')).toBeInTheDocument();
    });
    expect(useSessionStore.getState().status).toBe('unauthenticated');
  });
});
