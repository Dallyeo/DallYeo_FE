# Application Design (통합본) — Login · V01 · V02

> Application Design 단계 통합 문서. 세부는 분리 문서 참조:
> [`components.md`](./components.md) · [`component-methods.md`](./component-methods.md) · [`services.md`](./services.md) · [`component-dependency.md`](./component-dependency.md)

---

## 1. 설계 결정 요약 (Plan 답변 기반)

| # | 결정 | 선택 |
|---|---|---|
| Q1 | 서버 상태 관리 | **TanStack Query** (캐시/로딩/에러/재시도/무효화) |
| Q2 | 클라이언트 전역 상태 | **Zustand** (sessionStore=인증 단일 출처 등) |
| Q3 | 라우팅 | **React Router** (history 기반 시트/뒤로가기) |
| Q4 | Repository 분할 | **도메인별** (Auth/Course/Region/Onboarding) |
| Q5 | 브릿지 경계 | **혼합** — 데이터(login)는 Repository, 화면전환/디바이스는 BridgeService |
| Q6 | 로딩/에러/빈 상태 | **공용 AsyncBoundary** + TanStack Query 연동 |

CLAUDE.md 사전 확정(질문 제외): FSD-lite, Repository 패턴, 의존 방향, 폴더구조, 브릿지 추상화+mock, typed API+MSW, 세션=네이티브 단일 출처, React+TS+Vite+Tailwind, PBT=fast-check.

---

## 2. 레이어 & 폴더 매핑

```
src/
  app/        AppRoot · AppRouter · BottomTabBar · SafeAreaLayout
  features/
    login/        ui(LoginBottomSheet, LoginBanner) · model(useAuth, useGate, useLoginSheet, GateService) · api(AuthRepository impl)
    onboarding/   ui(OnboardingFlow, *Step) · model(useOnboarding, OnboardingService, onboardingStore) · api(OnboardingRepository impl)
    main/         ui(MainView, CourseCard, CoursePreviewPopup, RegionSelector) · model(useRecommendedCourses, useRegions) · api(Course/Region Repository impl)
    settings/     ui(MyPagePlaceholder + LoginBanner 호스팅)
  domain/
    types/        AppSession, Course, Region, OnboardingProfile, PermissionStatus ...
    logic/        profileValidation, sessionLogic, gateRules, regionLogic (PBT 대상)
    repositories/ Auth/Course/Region/Onboarding Repository 인터페이스
  shared/
    api/          apiClient, queryClient, mswHandlers
    bridge/       bridgeAdapter, mockBridge
    services/     BridgeService
    auth/         SessionService, sessionStore
    ui/           AsyncBoundary, BottomSheet, uiKit
    styles/       design tokens (Tailwind theme + CSS vars)
    mocks/        mock 데이터
```

---

## 3. 핵심 컴포넌트 (요약)

- **Domain**: 타입(계약) + 순수 로직 4종(profileValidation·sessionLogic·gateRules·regionLogic) + Repository 인터페이스. 무의존.
- **Data**: Repository 구현(HTTP/브릿지/mock) + apiClient(Bearer 자동·401 인터셉트) + bridgeAdapter/mockBridge + MSW.
- **Application**: sessionStore(인증 단일 출처)·loginSheetStore·onboardingStore + 훅(useAuth/useGate/useOnboarding/useRecommendedCourses/useRegions) + 서비스(SessionService/GateService/OnboardingService).
- **Presentation**: AppShell(Router·TabBar·SafeArea) + 공용 UI(AsyncBoundary·BottomSheet·uiKit) + 3개 화면 feature.

상세 시그니처: `component-methods.md`.

---

## 4. 서비스 오케스트레이션 (요약)

- **SessionService**: 부트스트랩 세션 복원 + sessionChanged 단일 구독 + 401 무효화(중복 1회 가드) → V02 라우팅 + 토스트.
- **GateService**: (인증상태×액션) 판정 → 허용 or 로그인 시트 오픈.
- **OnboardingService**: intro→permission→bodyInfo, 권한 거부해도 진행, 검증 동반 입력, 완료/건너뛰기 저장.
- **BridgeService**: 네이티브 화면전환/디바이스/이벤트 단일 추상화.
- 코스/지역 조회: 별도 서비스 없이 TanStack Query 훅 + Repository (과설계 방지).

상세 흐름: `services.md`, `component-dependency.md` §4.

---

## 5. 횡단 관심사 반영

| 관심사 | 설계 반영 |
|---|---|
| 인증 단일 출처 (NFR-AUTH-03) | sessionStore + SessionService 단일 구독 |
| 토큰 비저장 (SECURITY-12) | apiClient 메모리 보관, localStorage/cookie 금지 |
| 입력 검증 (SECURITY-05) | domain/logic/profileValidation (PBT 대상) |
| 접근 제어 (SECURITY-08) | gateRules + GateService, 클라 차단 + 서버 인가 이중방어 |
| 예외처리 (SECURITY-15) | AsyncBoundary 표준 로딩/에러/빈 상태 |
| 브릿지 추상화 (NFR-BRIDGE) | BridgeService + adapter/mock 주입 |
| WebView (NFR-WEBVIEW) | SafeAreaLayout + BottomSheet(history 엔트리) |
| Lo-Fi (NFR-UI-01) | shared/styles 디자인 토큰만 |
| region 확장성 (NFR-DATA-02) | RegionRepository 동적 조회 + regionCode:string |
| PBT (PBT-01) | domain/logic 4종이 1차 property 대상 |

---

## 6. Units 분해 예고 (다음 단계 입력)

execution-plan 권고와 일치하는 단위 후보 (Units Generation에서 확정):
1. **Foundation** — domain 타입/로직, apiClient+MSW, bridgeAdapter+mockBridge+BridgeService, sessionStore+SessionService, AppShell/Router/TabBar, 디자인 토큰, AsyncBoundary/uiKit
2. **Login** — LoginBottomSheet/Banner, useAuth/useGate, AuthRepository, GateService
3. **V01 Onboarding** — OnboardingFlow, useOnboarding, OnboardingRepository
4. **V02 Main** — MainView/CourseCard/Popup/RegionSelector, useRecommendedCourses/useRegions, Course/Region Repository

---

## 7. 설계 완전성 점검
- [x] 23개 FR → 컴포넌트/메서드 매핑 (component-methods §6)
- [x] 13개 스토리 → 컴포넌트 매핑 (components §4.3, methods §6)
- [x] 의존 방향 단방향·순환 없음 (component-dependency §5)
- [x] 인증/브릿지 단일 추상화 확립
- [x] Q1~Q6 결정 반영
- [x] Mermaid 검증 + 텍스트 대체 포함

---

## 8. Extension Compliance Summary — Application Design 단계

### Security Baseline
| 규칙 | 적용 | 비고 |
|---|---|---|
| SECURITY-05 (입력검증) | **Compliant** | profileValidation 컴포넌트로 설계 분리 |
| SECURITY-08 (접근제어) | **Compliant** | gateRules+GateService로 게이트 설계 |
| SECURITY-11 (보안핵심 분리) | **Compliant** | SessionService/sessionStore 단일 출처 분리 |
| SECURITY-12 (인증/자격증명) | **Compliant** | 토큰 메모리 보관, OAuth 브릿지 위임 |
| SECURITY-15 (예외처리) | **Compliant** | AsyncBoundary 표준화 |
| 그 외 | Deferred/N/A | NFR Design·Code Gen·Build 단계 책임 |

### Property-Based Testing
| 규칙 | 적용 | 비고 |
|---|---|---|
| PBT-01 (property 식별) | **Compliant** | domain/logic 4종을 1차 property 대상으로 명시 |
| PBT-09 | Deferred → NFR Requirements | fast-check 선정 예정 |
| 그 외 | Deferred → Functional Design/Code Gen | |

→ **블로킹 finding 없음.**
