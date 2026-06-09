/**
 * 인증 도메인 타입 (백엔드·네이티브와의 계약)
 * 토큰은 포함하지 않는다 — 메모리 보관, 네이티브 단일 출처 (NFR-AUTH-02).
 */
export interface AppSession {
  userId: string;
  displayName?: string;
  /** ISO 8601 만료 시각 (선택) */
  expiresAt?: string;
}

/** 인증 상태. 부트스트랩 전 초기값은 'unknown' (FD Q4) */
export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

/** MVP1 지원 제공자 (FR-LOGIN-01). Google 제외. */
export type AuthProvider = 'kakao' | 'apple';
