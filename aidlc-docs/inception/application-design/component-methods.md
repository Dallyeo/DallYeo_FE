# Component Methods — Login · V01 · V02

> Application Design 산출물. 메서드 시그니처 + 고수준 목적 + 입출력 타입.
> **상세 비즈니스 룰/예외 분기는 Construction의 Functional Design에서 정의.**
> 표기는 TypeScript 시그니처(계약). 모든 식별자는 영어, 사용자 노출 텍스트는 한국어.

---

## 1. Repository 인터페이스 (`domain/repositories/`)

### AuthRepository
```ts
interface AuthRepository {
  // bridge.login(provider) 위임 → AppSession. 웹은 OAuth 직접 수행 금지(NFR-AUTH-01).
  login(provider: AuthProvider): Promise<AppSession>;
  // bridge.logout 위임 + 백엔드 세션 정리.
  logout(): Promise<void>;
  // 네이티브가 주입한 현재 세션 조회(앱 부트스트랩 시).
  getCurrentSession(): Promise<AppSession | null>;
}
```

### CourseRepository
```ts
interface CourseRepository {
  // 지역별 추천 코스 목록. 빈 배열 가능(Empty 상태).
  listRecommended(regionCode: string): Promise<Course[]>;
  // 코스 상세(i-버튼 팝업/확인용).
  getById(courseId: string): Promise<Course>;
}
```

### RegionRepository
```ts
interface RegionRepository {
  // 지원 지역 목록(동적). MVP1은 군산 1건. 하드코딩 금지(NFR-DATA-02).
  listSupported(): Promise<Region[]>;
}
```

### OnboardingRepository
```ts
interface OnboardingRepository {
  getState(): Promise<OnboardingState>;       // 완료 여부 + 프로필
  saveProfile(profile: OnboardingProfile): Promise<void>;
  markCompleted(): Promise<void>;             // 완료/건너뛰기 공통 완료 플래그
}
```

---

## 2. BridgeService (`shared/services/`) — 화면 전환 / 디바이스 액션 (Q5 혼합)

```ts
interface BridgeService {
  // --- 네이티브 화면 전환 (one-way) ---
  openCourseSearch(): void;                                  // FR-V02-05
  openCourseConfirm(course: Course): void;                   // FR-V02-06
  startRun(course: Course): void;                            // (V09 진입, 본 라운드 범위 밖 호출부만)
  // --- 디바이스 / 권한 (async) ---
  getPermissionStatus(type: PermissionType): Promise<PermissionStatus>;
  requestPermission(type: PermissionType): Promise<PermissionStatus>;  // FR-V01-03
  openOSSettings(): void;
  pickProfilePhoto(): Promise<string>;
  share(payload: SharePayload): void;
  openExternalUrl(url: string): void;
  // --- 이벤트 구독 (네이티브→웹) ---
  on(event: BridgeEvent, handler: (payload: unknown) => void): Unsubscribe;
  // 'runCompleted' | 'runCancelled' | 'permissionChanged' | 'sessionChanged'
}
```
> 데이터 성격 호출 `login/logout`은 BridgeService가 아니라 `AuthRepository` 뒤에 위치(혼합 경계).

---

## 3. 인프라 (`shared/`)

### apiClient
```ts
interface ApiClient {
  get<T>(path: string, opts?: RequestOpts): Promise<T>;
  post<T>(path: string, body?: unknown, opts?: RequestOpts): Promise<T>;
  // 내부: Authorization Bearer 자동 주입, 401 → onUnauthorized 콜백(세션 무효화).
  setToken(token: string | null): void;            // 메모리 보관만(SECURITY-12)
  onUnauthorized(handler: () => void): Unsubscribe; // LOGIN-S4
}
```

### bridgeAdapter (저수준, BridgeService가 사용)
```ts
interface BridgeAdapter {
  invoke<T>(method: string, params?: unknown): Promise<T>; // request-id + promise registry
  post(method: string, params?: unknown): void;            // one-way
  on(event: string, handler: (payload: unknown) => void): Unsubscribe;
}
// mockBridge는 동일 인터페이스를 비동기로 모사(NFR-BRIDGE-03).
```

---

## 4. 도메인 순수 로직 (`domain/logic/`) — PBT 1차 대상

```ts
// profileValidation (FR-V01-05/06/09, SECURITY-05)
function isValidHeight(raw: string): boolean;   // 정수 & 1~3자리
function isValidWeight(raw: string): boolean;   // 정수 & 2~3자리
function isProfileComplete(p: OnboardingProfile): boolean; // 키·체중·성별 모두 채워짐 ⇔ true

// sessionLogic (LOGIN-S4)
function nextAuthStatus(current: AuthStatus, event: 'login'|'logout'|'expire'): AuthStatus;

// gateRules (FR-V02-03/04, SECURITY-08)
function isAllowed(status: AuthStatus, action: GateAction | 'recordsTab' | 'myPageTab'): boolean;

// regionLogic (FR-V02-08)
function resolveDefaultRegion(regions: Region[]): Region; // 군산 우선, 없으면 첫 항목
```

---

## 5. Application Hooks (`features/*/model/`)

```ts
// auth
function useAuth(): {
  status: AuthStatus;
  session: AppSession | null;
  login(provider: AuthProvider): Promise<void>;
  logout(): Promise<void>;
};

// login sheet + gate
function useGate(): {
  guard(action: GateAction): boolean;   // 허용 시 true, 비로그인 시 시트 오픈 후 false
};
function useLoginSheet(): { isOpen: boolean; open(action?: GateAction): void; close(): void };

// onboarding (V01)
function useOnboarding(): {
  step: 'intro' | 'permission' | 'bodyInfo';
  profile: OnboardingProfile;
  canSubmit: boolean;                   // isProfileComplete 파생(FR-V01-09)
  requestLocation(): Promise<PermissionStatus>;
  setField(field: keyof OnboardingProfile, value: unknown): void; // 검증 동반
  skip(): Promise<void>;                // FR-V01-08
  complete(): Promise<void>;            // FR-V01-09
};

// main (V02)
function useRecommendedCourses(regionCode: string): QueryResult<Course[]>;
function useRegions(): QueryResult<Region[]>;
function useSelectedRegion(): { region: Region; setRegion(code: string): void };
```

> `QueryResult<T>`는 TanStack Query 결과(data/isLoading/isError/refetch)로, `AsyncBoundary`가 소비.

---

## 6. 메서드 ↔ 스토리/FR 추적

| 메서드 | 스토리 | FR |
|---|---|---|
| AuthRepository.login | LOGIN-S2 | FR-LOGIN-01/05 |
| sessionStore/apiClient.onUnauthorized | LOGIN-S4 | FR-LOGIN-06 |
| useGate.guard | LOGIN-S1, V02-S2 | FR-LOGIN-03, FR-V02-03/04 |
| useLoginSheet.open | LOGIN-S1/S3 | FR-LOGIN-02/04 |
| useOnboarding.requestLocation | V01-S2 | FR-V01-03 |
| profileValidation.* | V01-S3 | FR-V01-05/06/09 |
| useOnboarding.skip | V01-S4 | FR-V01-08 |
| useRecommendedCourses | V02-S1 | FR-V02-01 |
| BridgeService.openCourseSearch | V02-S3 | FR-V02-05 |
| BridgeService.openCourseConfirm | V02-S3 | FR-V02-06 |
| CourseRepository.getById | V02-S5 | FR-V02-07 |
| useRegions / resolveDefaultRegion | V02-S4 | FR-V02-08 |
