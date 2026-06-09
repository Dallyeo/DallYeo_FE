import { describe, it, expect } from 'vitest';
import { createMockBridgeAdapter } from './mockBridge';
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
