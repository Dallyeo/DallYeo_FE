/**
 * 환경 설정 단일 출처 (P-3, NFR-DATA-01).
 * VITE_* 플래그를 파싱. mock/실연동 전환에 사용.
 */
function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const env = {
  /** 인증계(로그인/프로필/기록/저장/업적) — 아직 미구현, MSW 목 유지. */
  apiBaseUrl,
  /**
   * 공개계(regions/courses/places) — **실 백엔드 기본 연결**.
   * 인증이 필요 없고 배포되어 있어 목 없이 바로 쓴다. 로컬 백엔드로 돌리려면
   * `VITE_PUBLIC_API_BASE_URL=http://localhost:8080` 으로 덮어쓴다.
   */
  publicApiBaseUrl:
    import.meta.env.VITE_PUBLIC_API_BASE_URL ??
    // dev는 Vite 프록시(`/public-api`)를 탄다 — 백엔드가 CORS 헤더를 안 주기 때문.
    (import.meta.env.DEV ? '/public-api' : 'https://dallyeo.cloud'),
  /** 백엔드 미준비 시 MSW mock 사용 (기본 on) */
  enableMsw: parseBool(import.meta.env.VITE_ENABLE_MSW, true),
  /** 강제 mock 브릿지 사용 (없어도 브라우저면 자동 mock) */
  forceMockBridge: parseBool(import.meta.env.VITE_FORCE_MOCK_BRIDGE, false),
} as const;
