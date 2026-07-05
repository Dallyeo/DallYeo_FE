/**
 * 공유/외부 연동 타입
 */
export interface SharePayload {
  title?: string;
  text?: string;
  url?: string;
}

/** 구독 해제 함수 (브릿지 이벤트 등) */
export type Unsubscribe = () => void;
