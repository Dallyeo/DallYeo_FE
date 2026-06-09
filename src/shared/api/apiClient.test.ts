import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, ApiError, setToken, clearToken } from './apiClient';

function mockFetch(status: number, body: unknown = {}) {
  return vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as Response);
}

describe('apiClient', () => {
  beforeEach(() => {
    clearToken();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('토큰이 있으면 Authorization Bearer 헤더 주입', async () => {
    const fetchMock = mockFetch(200, { ok: true });
    vi.stubGlobal('fetch', fetchMock);
    setToken('abc');
    await apiClient.get('/foo');
    const [, init] = fetchMock.mock.calls[0]!;
    expect((init as RequestInit).headers).toMatchObject({ Authorization: 'Bearer abc' });
  });

  it('토큰이 없으면 Authorization 헤더 없음', async () => {
    const fetchMock = mockFetch(200, {});
    vi.stubGlobal('fetch', fetchMock);
    await apiClient.get('/foo');
    const [, init] = fetchMock.mock.calls[0]!;
    expect((init as RequestInit).headers).not.toHaveProperty('Authorization');
  });

  it('401이면 onUnauthorized 콜백 호출 후 ApiError(401) throw', async () => {
    vi.stubGlobal('fetch', mockFetch(401));
    const spy = vi.fn();
    const off = apiClient.onUnauthorized(spy);
    await expect(apiClient.get('/secure')).rejects.toBeInstanceOf(ApiError);
    expect(spy).toHaveBeenCalledTimes(1);
    off();
  });

  it('비-2xx는 ApiError throw', async () => {
    vi.stubGlobal('fetch', mockFetch(500));
    await expect(apiClient.get('/foo')).rejects.toMatchObject({ status: 500 });
  });
});
