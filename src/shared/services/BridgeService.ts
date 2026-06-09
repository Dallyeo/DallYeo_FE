import type {
  AppSession,
  AuthProvider,
  Course,
  PermissionStatus,
  PermissionType,
  Unsubscribe,
} from '@/domain/types';
import {
  resolveBridgeAdapter,
  type BridgeAdapter,
  type BridgeEventName,
  type BridgeLoginResult,
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

  getCurrentSession(): Promise<AppSession | null> {
    return this.adapter.invoke<AppSession | null>('getCurrentSession');
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

  on(event: BridgeEventName, handler: (payload: unknown) => void): Unsubscribe {
    return this.adapter.on(event, handler);
  }
}

/** 앱 전역 단일 인스턴스 */
export const bridgeService = new BridgeService();
