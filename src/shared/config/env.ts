/**
 * 환경 설정 단일 출처 (P-3, NFR-DATA-01).
 * VITE_* 플래그를 파싱. mock/실연동 전환에 사용.
 */
declare global {
  interface Window {
    /** 네이티브가 주입하는 공개 API base (선택). */
    __DALLYEO_PUBLIC_API_BASE__?: string;
  }
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

/**
 * API origin. 인증계(auth/users/runs/achievements)와 공개계(regions/courses/places)는
 * **같은 호스트**다(backend-api.md: Base URL `https://dallyeo.cloud`).
 * 우선순위: **네이티브 런타임 주입** > 빌드 환경변수 > 기본값.
 * 네이티브는 웹 로드 **전에** `window.__DALLYEO_PUBLIC_API_BASE__`를 세팅해 리빌드 없이 바꿀 수 있다
 * (예: 커스텀 스킴 핸들러로 프록시할 때). CORS 이슈는 BRIDGE.md §9 참조.
 * dev는 Vite 프록시(`/public-api`)를 탄다 — 백엔드가 CORS 헤더를 안 주기 때문.
 */
const apiOrigin =
  (typeof window !== 'undefined' ? window.__DALLYEO_PUBLIC_API_BASE__ : undefined) ??
  import.meta.env.VITE_PUBLIC_API_BASE_URL ??
  (import.meta.env.DEV ? '/public-api' : 'https://dallyeo.cloud');

export const env = {
  /**
   * 인증계(로그인/프로필/기록/업적). backend-api.md §10 기준 U4(인증·사용자)·U5(러닝 기록)·
   * U6(업적)이 모두 완료되어 **실 백엔드에 직접 연결**한다.
   * 별도 호스트로 돌리려면 `VITE_API_BASE_URL`로 덮어쓴다.
   */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? apiOrigin,
  /** 공개계(regions/courses/places) — 인증 불필요, 같은 호스트 */
  publicApiBaseUrl: apiOrigin,
  /**
   * MSW mock 사용 여부. **기본 off** — 백엔드가 다 붙었다.
   * 백엔드 없이(오프라인/비행기) 화면만 볼 때 `VITE_ENABLE_MSW=true`로 켠다.
   * ⚠️ 켜두면 `/runs`·`/achievements`·`/users/me`가 전부 목으로 가로채져
   * 실기기에서도 가짜 데이터가 보인다.
   */
  enableMsw: parseBool(import.meta.env.VITE_ENABLE_MSW, false),
  /** 강제 mock 브릿지 사용 (없어도 브라우저면 자동 mock) */
  forceMockBridge: parseBool(import.meta.env.VITE_FORCE_MOCK_BRIDGE, false),
  /**
   * 개발용 실 액세스 토큰. mock 브릿지가 이 값을 반환해 **브라우저에서 실 백엔드**에
   * 붙을 수 있게 한다(OAuth는 네이티브만 가능 — 기기에서 발급된 토큰을 복사해 온다).
   * `localStorage['dallyeo.dev.token']`이 더 우선한다(빌드 없이 교체 가능).
   * ⚠️ **dev 빌드에서만 읽는다** — 프로덕션 번들에 토큰이 섞여 들어가지 않도록.
   */
  devAccessToken: import.meta.env.DEV
    ? (import.meta.env.VITE_DEV_ACCESS_TOKEN ?? undefined)
    : undefined,
} as const;
