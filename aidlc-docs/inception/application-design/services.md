# Services — Login · V01 · V02

> Application Design 산출물. 서비스 정의 + 책임 + 오케스트레이션 패턴.
> 서비스 = 여러 컴포넌트/Repository/브릿지를 조율하는 계층. (Q5 혼합 경계 반영)

---

## 1. 서비스 목록

| 서비스 | 위치 | 책임 |
|---|---|---|
| `SessionService` | `shared/auth/` | 인증 단일 출처. 부트스트랩 세션 로드, sessionChanged 구독, 401 무효화 조율, sessionStore 갱신. |
| `BridgeService` | `shared/services/` | 네이티브 화면 전환 + 디바이스/권한 액션 + 이벤트 구독 추상화. bridgeAdapter(또는 mockBridge) 위임. |
| `GateService` | `features/login/model/` | (인증상태 × 액션) 게이트 판정 → 허용 or 로그인 시트 오픈 조율. |
| `OnboardingService` | `features/onboarding/model/` | 온보딩 단계 진행 + 검증 + 권한 요청 + 완료/건너뛰기 저장 조율. |

> 데이터 조회(코스/지역)는 별도 서비스 없이 **Repository + TanStack Query 훅**이 직접 담당(과설계 방지, CLAUDE.md "no use-case-class-per-action").

---

## 2. SessionService — 인증 오케스트레이션 (핵심)

**책임**: 앱 전역 인증 상태의 단일 출처(NFR-AUTH-03). 토큰은 메모리(apiClient)에만 보관.

**오케스트레이션**
```
[부트스트랩]
AppRoot mount
  → SessionService.bootstrap()
     → AuthRepository.getCurrentSession()  (네이티브 주입 세션)
     → 있으면 apiClient.setToken(token) + sessionStore = authenticated
     → 없으면 sessionStore = unauthenticated
  → SessionService.subscribe()
     → BridgeService.on('sessionChanged', ...)   // 단일 구독자
     → apiClient.onUnauthorized(...)             // 401 신호

[로그인]  useAuth.login(provider)
  → AuthRepository.login(provider)  // 내부 bridge.login
  → apiClient.setToken + sessionStore = authenticated + 로그인 시트 close

[세션 무효화]  401 OR sessionChanged(logout)  (LOGIN-S4, FR-LOGIN-06)
  → 두 신호 합류해도 1회만 실행(중복 가드)
  → sessionStore = unauthenticated + apiClient.setToken(null)
  → navigate(V02 메인뷰) + Toast("로그아웃되었습니다")
```

---

## 3. GateService — 게이트 조율 (LOGIN-S1, V02-S2)

**책임**: 비로그인 사용자의 게이트 액션을 차단하고 로그인 시트로 유도.

**오케스트레이션**
```
useGate.guard(action)
  → gateRules.isAllowed(sessionStore.status, action)
     → true  : 액션 그대로 진행
     → false : loginSheetStore.open(action)  // 중복 시트 방지 → false 반환
[로그인 성공 후]
  → (선택) 기억한 action 재개 또는 단순 시트 close
```
**대상 액션**: recordsTab, myPageProfile, myPageEditInfo, myPageAccount, saveRunResult. (마이페이지 탭 자체 진입은 허용, 내부 항목만 게이트 — FR-V02-04)

---

## 4. OnboardingService — 온보딩 조율 (V01-S1~S4)

**오케스트레이션**
```
intro → permission → bodyInfo → 완료/건너뛰기

[권한 단계]  requestLocation()
  → BridgeService.requestPermission('location')
  → granted/denied/blocked 무관하게 다음 단계 진행 가능(FR-V01-03)

[입력 단계]  setField()
  → profileValidation으로 즉시 검증(키≤3자리/체중2~3자리)
  → canSubmit = isProfileComplete(profile)  // 입력완료 버튼 활성(FR-V01-09)

[완료]  complete()
  → OnboardingRepository.saveProfile + markCompleted → navigate(V02)
[건너뛰기]  skip()
  → 프로필 미저장 + markCompleted → navigate(V02)  (FR-V01-08)
```

---

## 5. BridgeService — 네이티브 추상화

**책임**: 모든 네이티브 상호작용의 단일 진입점. UI는 `window.DallYeoBridge` 직접 접근 금지(NFR-BRIDGE-01).
- 화면 전환(one-way): openCourseSearch / openCourseConfirm / startRun
- 디바이스/권한(async): getPermissionStatus / requestPermission / openOSSettings / pickProfilePhoto
- 기타: share / openExternalUrl
- 이벤트: on('runCompleted'|'runCancelled'|'permissionChanged'|'sessionChanged')
- 구현: `bridgeAdapter`(실제) 또는 `mockBridge`(브라우저) 주입 — 환경 분기는 부트스트랩 1회(NFR-BRIDGE-03).

---

## 6. 서비스 상호작용 요약

| 트리거 | 주관 서비스 | 협력 |
|---|---|---|
| 앱 시작 세션 복원 | SessionService | AuthRepository, BridgeService, apiClient |
| 소셜 로그인 | SessionService(via useAuth) | AuthRepository(bridge.login) |
| 게이트 액션 차단 | GateService | sessionStore, gateRules, loginSheetStore |
| 세션 만료/로그아웃 | SessionService | apiClient(401), BridgeService(sessionChanged), Router, Toast |
| 온보딩 진행 | OnboardingService | BridgeService(권한), profileValidation, OnboardingRepository |
| 코스/지역 조회 | (서비스 없음) | TanStack Query 훅 + CourseRepository/RegionRepository |
| 네이티브 코스 전환 | BridgeService | — |
