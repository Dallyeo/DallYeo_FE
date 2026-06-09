/**
 * 공유/외부 연동 타입
 */
export interface SharePayload {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * 완주 결과 (V10) — 본 라운드 미구현 placeholder.
 * 필드는 V10 라운드에서 'runCompleted' 페이로드 기준으로 확정한다.
 */
export interface RunResult {
  /** placeholder. 실제 필드는 V10에서 정의 */
  readonly _placeholder?: never;
}

/** 구독 해제 함수 (브릿지 이벤트 등) */
export type Unsubscribe = () => void;
