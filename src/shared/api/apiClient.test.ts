import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, ApiError, withRetry, setToken, clearToken } from './apiClient';

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

  it('{success, data} 래퍼면 data를 언랩해서 반환', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { success: true, data: [{ id: 'x' }] }));
    await expect(apiClient.get('/list')).resolves.toEqual([{ id: 'x' }]);
  });

  it('래퍼가 아니면(구 mock) 원본 그대로 반환', async () => {
    vi.stubGlobal('fetch', mockFetch(200, [{ id: 'y' }]));
    await expect(apiClient.get('/list')).resolves.toEqual([{ id: 'y' }]);
  });

  it('success:false면 error.code를 담아 ApiError throw', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(200, { success: false, error: { code: 'NOT_FOUND', message: '없음' } }),
    );
    await expect(apiClient.get('/x')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('에러 응답 래퍼(비-2xx)에서 error.code 추출', async () => {
    vi.stubGlobal('fetch', mockFetch(502, { success: false, error: { code: 'EXTERNAL_API_ERROR' } }));
    await expect(apiClient.get('/places/nearby')).rejects.toMatchObject({
      status: 502,
      code: 'EXTERNAL_API_ERROR',
    });
  });
});

describe('withRetry', () => {
  it('EXTERNAL_API_ERROR(502)는 재시도 후 성공', async () => {
    let n = 0;
    const fn = vi.fn().mockImplementation(async () => {
      n += 1;
      if (n < 3) throw new ApiError(502, { code: 'EXTERNAL_API_ERROR' });
      return 'ok';
    });
    await expect(withRetry(fn, { retries: 2 })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('재시도 대상 아닌 에러(404)는 즉시 throw', async () => {
    const fn = vi.fn().mockRejectedValue(new ApiError(404, { code: 'NOT_FOUND' }));
    await expect(withRetry(fn, { retries: 2 })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
