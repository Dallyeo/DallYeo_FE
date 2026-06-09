# Unit of Work — Login · V01 · V02

> Units Generation 산출물. 개발 단위 정의 + 책임 + 코드 조직 전략.
> 배포 모델: 단일 SPA(LOCAL 번들). 단위 = 모놀리식 내부 **논리 모듈**(독립 배포 아님).
> 결정: 4단위(Q1=A) · 순서 U0→U1→U2→U3(Q2=A) · **Foundation 최소 골격(Q3=B)** · U0 공유 의존(Q4=A) · MVP3 보류 항목 제외(Q5=A).

---

## 1. 단위 목록 & 책임

### U0 — Foundation (최소 골격, Q3=B)
**책임**: 모든 화면이 의존하는 **뼈대만** 우선 구축. 무거운 인프라는 처음 필요한 단위에서 점진 도입.
- **포함(이번 U0)**:
  - `domain/types/` — 전 도메인 타입(계약): AppSession, AuthStatus/Provider, Gender, OnboardingProfile/State, PermissionType/Status, Region, Course, SharePayload, GateAction (+ RunResult placeholder)
  - `domain/logic/` — 순수 로직 4종: profileValidation · sessionLogic · gateRules · regionLogic (PBT 1차 대상)
  - `domain/repositories/` — Repository **인터페이스** 선언(Auth/Course/Region/Onboarding)
  - `app/` — AppRoot · AppRouter(빈 라우트 골격) · BottomTabBar(껍데기) · SafeAreaLayout
  - `shared/styles/` — 디자인 토큰(Tailwind theme + CSS 변수)
- **미포함(→ 후속 단위에서 점진 도입, 단 물리적으로는 shared/에 귀속)**:
  - apiClient + queryClient + MSW → 최초 사용 단위(U1 인증 토큰/401, 이후 U3 코스)
  - bridgeAdapter + mockBridge + BridgeService → U1(bridge.login)에서 최초 도입
  - sessionStore + SessionService → U1
  - AsyncBoundary + uiKit 확장 → 최초 비동기 데이터 UI 단위(U3 코스 목록)에서 도입

> **점진 도입 원칙**: 인프라 컴포넌트는 "처음 필요한 단위"에서 생성하되 `shared/` 네임스페이스에 두어 이후 단위가 재사용. 단위 간 직접 의존은 만들지 않음(Q4=A).

### U1 — Login
**책임**: 소셜 로그인 + 게이트 + 세션 라이프사이클. (이 단위에서 인증 관련 공통 인프라를 최초 도입)
- `features/login/ui/` — LoginBottomSheet(Kakao/Apple), LoginBanner
- `features/login/model/` — useAuth, useGate, useLoginSheet, GateService
- `features/login/api/` — AuthRepository 구현(bridge.login 위임)
- **이 단위에서 도입하는 shared 인프라**: bridgeAdapter+mockBridge+BridgeService, sessionStore+SessionService, apiClient(Bearer/401)+queryClient
- 스토리: LOGIN-S1, LOGIN-S2, LOGIN-S3, LOGIN-S4

### U2 — Onboarding (V01)
**책임**: 1회성 온보딩(소개 → 위치 권한 → 신체 정보 + 검증/건너뛰기).
- `features/onboarding/ui/` — OnboardingFlow, ServiceIntroStep, LocationPermissionStep, BodyInfoStep
- `features/onboarding/model/` — useOnboarding, OnboardingService, onboardingStore
- `features/onboarding/api/` — OnboardingRepository 구현
- **재사용**: U0 domain.logic(profileValidation), U1 BridgeService(requestPermission)
- 스토리: V01-S1, V01-S2, V01-S3, V01-S4

### U3 — Main (V02)
**책임**: 메인 허브 + 추천 코스 + 지역 + 네이티브 코스 진입.
- `features/main/ui/` — MainView, RecommendedCourseList, CourseCard, CoursePreviewPopup, RegionSelector, CreateCourseButton
- `features/main/model/` — useRecommendedCourses, useRegions, useSelectedRegion
- `features/main/api/` — CourseRepository, RegionRepository 구현
- **이 단위에서 도입하는 shared 인프라**: AsyncBoundary(로딩/에러/빈 상태), MSW 코스/지역 핸들러
- **재사용**: U0 domain(Course/Region, regionLogic), U1 BridgeService(openCourseSearch/Confirm)+useGate(탭바 게이트)
- 스토리: V02-S1, V02-S2, V02-S3, V02-S4, V02-S5

---

## 2. 코드 조직 전략 (Greenfield)

단일 SPA. FSD-lite 폴더 구조에 단위를 매핑:

```
src/
  app/            <- U0 (셸/라우터/탭바/safe-area)
  domain/         <- U0 (types, logic, repository 인터페이스)
  shared/
    styles/       <- U0 (디자인 토큰)
    bridge/ services/ auth/   <- U1에서 도입(점진)
    api/ mocks/    <- U1(apiClient) · U3(MSW 코스/지역)
    ui/            <- U0(기본) · U3(AsyncBoundary)
  features/
    login/        <- U1
    onboarding/   <- U2
    main/         <- U3
    settings/     <- U1(LoginBanner 호스팅 placeholder)
```

- 단위는 폴더 경계로 구분되나 하나의 빌드 산출물(single bundle).
- 각 단위는 Construction에서 Functional Design → NFR → Code Generation 순으로 완성 후 다음 단위로.

---

## 3. 본 라운드 제외 (Q5=A)
- V11 기간통계/막대그래프, V14 업적: 단위 미생성. (RunResult만 U0에 placeholder 타입으로 예약 — V10 연계 대비)
- V03~V09(네이티브 소유): 단위 대상 아님.

---

## 4. 단위 경계/완전성 검증
- [x] 13개 스토리 전부 단위 배정(U1=4, U2=4, U3=5) — `unit-of-work-story-map.md`
- [x] U0는 스토리 직접 보유 없음(전 단위 토대) — 의도된 인프라 단위
- [x] 단위 간 직접 의존 없음, 모두 U0(shared/domain) 경유(Q4=A) — `unit-of-work-dependency.md`
- [x] 구축 순서 의존성 위배 없음(U0→U1→U2→U3)
- [x] Q1~Q5 결정 반영(특히 Q3=B 점진 인프라)
