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

/**
 * 이미지 공유/저장 페이로드 (V10·V12 티켓).
 *
 * 이미지는 **브릿지를 왕복시키지 않는다** — data URL은 수 MB짜리 문자열이라
 * 왕복하면 `WKScriptMessageHandler` 직렬화 비용이 눈에 띄게 커진다.
 * 웹이 한 번 만들어 넘기면 네이티브가 공유 시트 제시/앨범 저장까지 끝낸다.
 */
export interface ImagePayload {
  /** `data:image/png;base64,...` */
  dataUrl: string;
  /** 저장 파일명 힌트 (확장자 포함) */
  fileName: string;
  /** 공유 시트에 함께 띄울 문구 (저장 시 무시) */
  text?: string;
}

/** 앨범 저장 결과 — `denied`는 사진 권한 거부(네이티브가 설정 안내를 띄운다) */
export type SaveImageResult = 'saved' | 'denied' | 'failed';
