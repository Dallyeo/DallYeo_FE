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
   * 공개계(regions/courses/places) — 백엔드 배포 완료.
   * 기본은 apiBaseUrl과 동일 → dev/브라우저 프리뷰에서 MSW가 그대로 목. 실연동 시 VITE_PUBLIC_API_BASE_URL=https://dallyeo.cloud 로 전환.
   */
  publicApiBaseUrl: import.meta.env.VITE_PUBLIC_API_BASE_URL ?? apiBaseUrl,
  /** 백엔드 미준비 시 MSW mock 사용 (기본 on) */
  enableMsw: parseBool(import.meta.env.VITE_ENABLE_MSW, true),
  /** 강제 mock 브릿지 사용 (없어도 브라우저면 자동 mock) */
  forceMockBridge: parseBool(import.meta.env.VITE_FORCE_MOCK_BRIDGE, false),
} as const;
