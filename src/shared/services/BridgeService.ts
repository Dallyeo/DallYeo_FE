import type {
  AuthProvider,
  Course,
  ImagePayload,
  PermissionStatus,
  PermissionType,
  SaveImageResult,
  SharePayload,
  Unsubscribe,
} from '@/domain/types';
import {
  resolveBridgeAdapter,
  type BridgeAdapter,
  type BridgeEventName,
  type BridgeLoginResult,
  type BridgeSessionResult,
} from '@/shared/bridge';

/**
 * 네이티브 상호작용 단일 추상화 (NFR-BRIDGE-01).
 * U1에서는 인증 관련(login/logout/getCurrentSession) + 이벤트 구독 도입.
 * 화면 전환/디바이스 액션(openCourseSearch 등)은 U2/U3에서 확장.
 */
export class BridgeService {
  private readonly injected: BridgeAdapter | undefined;

  constructor(adapter?: BridgeAdapter) {
    this.injected = adapter;
  }

  /** 어댑터를 지연 해석 — 테스트에서 주입/교체 가능 (resolveBridgeAdapter 캐시 활용) */
  private get adapter(): BridgeAdapter {
    return this.injected ?? resolveBridgeAdapter();
  }

  /** OAuth 위임 — 웹은 핸드셰이크 미수행 (NFR-AUTH-01). 결과로 세션+토큰 수신. */
  login(provider: AuthProvider): Promise<BridgeLoginResult> {
    return this.adapter.invoke<BridgeLoginResult>('login', { provider });
  }

  logout(): Promise<void> {
    return this.adapter.invoke<void>('logout');
  }

  /**
   * 계정 삭제(탈퇴) — 네이티브가 자기 토큰으로 `DELETE /users/me` 호출 + Keychain 파기 +
   * `sessionChanged(unauthenticated)` emit 까지 한 번에 처리한다.
   *
   * ⚠️ **아직 호출하지 않는다.** 현재 탈퇴는 웹이 `DELETE /users/me`를 직접 친다
   * (`SettingsView.deleteAccount`). 자격증명을 소유한 쪽이 그 자격증명을 쓰는 연산을
   * 수행하는 게 옳지만, 어댑터에 capability 감지가 없어 미구현 플랫폼에서 호출하면
   * 10초 타임아웃(`bridgeAdapter.ts`)이 난다 → **네이티브 구현이 확인된 뒤** 전환한다.
   */
  deleteAccount(): Promise<void> {
    return this.adapter.invoke<void>('deleteAccount');
  }

  /** 네이티브 주입 세션 조회 — 로그인 상태면 세션+토큰, 미로그인이면 null (부트스트랩용) */
  getCurrentSession(): Promise<BridgeSessionResult> {
    return this.adapter.invoke<BridgeSessionResult>('getCurrentSession');
  }

  /** 권한 상태 조회 (FR-V01-03) */
  getPermissionStatus(type: PermissionType): Promise<PermissionStatus> {
    return this.adapter.invoke<PermissionStatus>('getPermissionStatus', { type });
  }

  /** 권한 요청 (FR-V01-03) */
  requestPermission(type: PermissionType): Promise<PermissionStatus> {
    return this.adapter.invoke<PermissionStatus>('requestPermission', { type });
  }

  /** 네이티브 검색뷰(V04) 진입 — one-way (FR-V02-05) */
  openCourseSearch(): void {
    this.adapter.post('openCourseSearch');
  }

  /** 네이티브 코스 확인뷰(V08) 진입 — one-way (FR-V02-06) */
  openCourseConfirm(course: Course): void {
    this.adapter.post('openCourseConfirm', { course });
  }

  /** 네이티브 공유 시트 — one-way (FR-V10 공유하기) */
  share(payload: SharePayload): void {
    this.adapter.post('share', { payload });
  }

  /**
   * 티켓 이미지 공유 — 네이티브 공유 시트에 **이미지를 첨부**해서 띄운다.
   * iOS `UIActivityViewController(activityItems: [UIImage])` / Android `ACTION_SEND` + `image/png`.
   *
   * 웹 단독으로는 불가능하다 — `navigator.share`는 WKWebView/Android WebView에서 신뢰할 수 없고
   * 파일 첨부(Level 2)는 더 제한적이다.
   *
   * ⚠️ 네이티브 미구현 플랫폼에서는 10초 뒤 `BridgeError('timeout')`이 난다
   * (`bridgeAdapter.ts`) — 호출부에서 잡아 안내 토스트로 처리할 것.
   */
  shareImage(payload: ImagePayload): Promise<void> {
    return this.adapter.invoke<void>('shareImage', { payload });
  }

  /**
   * 티켓 이미지를 **사진 앨범에 저장**.
   * 웹에는 앨범 쓰기 API 자체가 없다 — iOS는 `PHPhotoLibrary` +
   * `NSPhotoLibraryAddUsageDescription`, Android는 `MediaStore`(API 29+ 권한 불필요)가 필요하다.
   * 권한 거부 시 `'denied'`를 돌려주고 설정 안내는 네이티브가 띄운다.
   */
  saveImage(payload: ImagePayload): Promise<SaveImageResult> {
    return this.adapter.invoke<SaveImageResult>('saveImage', { payload });
  }

  /** 외부 URL 열기(카카오/네이버 지도 등) — one-way (FR-V10 주변장소 연결) */
  openExternalUrl(url: string): void {
    this.adapter.post('openExternalUrl', { url });
  }

  /** 네이티브 사진 선택 — 결과 URL 반환 (FR-V13 프로필 사진) */
  pickProfilePhoto(): Promise<string> {
    return this.adapter.invoke<string>('pickProfilePhoto');
  }

  on(event: BridgeEventName, handler: (payload: unknown) => void): Unsubscribe {
    return this.adapter.on(event, handler);
  }
}

/** 앱 전역 단일 인스턴스 */
export const bridgeService = new BridgeService();
