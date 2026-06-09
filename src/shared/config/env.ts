/**
 * 환경 설정 단일 출처 (P-3, NFR-DATA-01).
 * VITE_* 플래그를 파싱. mock/실연동 전환에 사용.
 */
function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  /** 백엔드 미준비 시 MSW mock 사용 (기본 on) */
  enableMsw: parseBool(import.meta.env.VITE_ENABLE_MSW, true),
  /** 강제 mock 브릿지 사용 (없어도 브라우저면 자동 mock) */
  forceMockBridge: parseBool(import.meta.env.VITE_FORCE_MOCK_BRIDGE, false),
} as const;
