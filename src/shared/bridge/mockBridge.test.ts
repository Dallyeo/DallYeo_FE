import { describe, it, expect, afterEach } from 'vitest';
import { createMockBridgeAdapter, DEV_TOKEN_KEY } from './mockBridge';
import { BridgeError, type BridgeLoginResult } from './types';

describe('mockBridge.login 분기 (BR-U1-6, FD Q4)', () => {
  it('success: AppSession + token 반환', async () => {
    const adapter = createMockBridgeAdapter({ loginScenario: 'success', delayMs: 1 });
    const result = await adapter.invoke<BridgeLoginResult>('login', { provider: 'kakao' });
    expect(result.session.userId).toBeTruthy();
    expect(result.token).toBeTruthy();
  });

  it('cancel: BridgeError(cancelled)', async () => {
    const adapter = createMockBridgeAdapter({ loginScenario: 'cancel', delayMs: 1 });
    await expect(adapter.invoke('login')).rejects.toMatchObject({ kind: 'cancelled' });
  });

  it('fail: BridgeError(failed)', async () => {
    const adapter = createMockBridgeAdapter({ loginScenario: 'fail', delayMs: 1 });
    await expect(adapter.invoke('login')).rejects.toBeInstanceOf(BridgeError);
  });

  it('getCurrentSession 기본 null', async () => {
    const adapter = createMockBridgeAdapter({ delayMs: 1 });
    await expect(adapter.invoke('getCurrentSession')).resolves.toBeNull();
  });
});

describe('mock 브릿지 개발용 토큰 (브라우저에서 실 백엔드 붙기)', () => {
  afterEach(() => window.localStorage.clear());

  it('토큰 없음: login은 가짜 토큰, getCurrentSession은 미로그인', async () => {
    const bridge = createMockBridgeAdapter({ delayMs: 0 });
    const login = await bridge.invoke<{ token: string }>('login', { provider: 'kakao' });
    expect(login.token).toBe('mock-token');
    expect(await bridge.invoke('getCurrentSession')).toBeNull();
  });

  it('localStorage 토큰: login이 그 토큰을 주고 새로고침해도 세션 유지', async () => {
    window.localStorage.setItem(DEV_TOKEN_KEY, 'real-token');
    const bridge = createMockBridgeAdapter({ delayMs: 0 });

    const login = await bridge.invoke<{ token: string }>('login', { provider: 'kakao' });
    expect(login.token).toBe('real-token');

    const restored = await bridge.invoke<{ token: string } | null>('getCurrentSession');
    expect(restored?.token).toBe('real-token');
  });
});
