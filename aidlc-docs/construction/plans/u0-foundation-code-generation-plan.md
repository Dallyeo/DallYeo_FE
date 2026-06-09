# U0 Foundation — Code Generation Plan

> CONSTRUCTION / Code Generation **Part 1 (Planning)** — 단위: U0 Foundation.
> 이 플랜은 Code Generation의 **단일 진실 원천**입니다. 승인 후 Part 2에서 단계별로 실행하며 각 단계 완료 시 `[x]` 마킹.
> 코드 위치: **워크스페이스 루트** `/Users/palrang22/Documents/Projects/DallYeo_FE/` (절대 `aidlc-docs/` 아님). 문서 요약만 `aidlc-docs/construction/u0-foundation/code/`.

---

## 단위 컨텍스트

- **단위**: U0 Foundation (골격, Q3=B — 무거운 인프라는 U1~ 점진 도입)
- **구현 스토리**: 직접 스토리 없음(인프라 토대). 전 스토리(LOGIN-S*/V01-S*/V02-S*)가 의존하는 도메인 계약·로직·셸·토큰 제공.
- **단위 의존**: 없음(U0이 최하위 토대).
- **제공 인터페이스/계약**: domain types, domain logic 4종, Repository 인터페이스, 앱 셸/라우터/탭바, 디자인 토큰, 에러 경계, env config, 공용 test arbitraries.
- **프로젝트 유형**: Greenfield, 단일 SPA(모놀리식). 구조: 워크스페이스 루트 `src/` (CLAUDE.md FSD-lite).
- **기술/툴링**: pnpm · React+TS+Vite · Tailwind · Vitest+fast-check+Testing Library+jsdom · ESLint+Prettier · TS strict+.

---

## 실행 단계 (번호순)

### Step 1 — 프로젝트 스캐폴딩 (greenfield)
- [x] `package.json` (pnpm, React/TS/Vite/Tailwind/Router/Query/Zustand + dev: vitest/fast-check/testing-library/jsdom/eslint/prettier)
- [x] `tsconfig.json` / `tsconfig.node.json` (strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes 등)
- [x] `vite.config.ts`, `vitest.config.ts` (jsdom, setupFiles, fast-check seed via env)
- [x] `tailwind.config.ts`, `postcss.config.js`
- [x] `.eslintrc.cjs`, `.prettierrc`, `.gitignore`(이미 존재 시 보강), `.nvmrc`
- [x] `index.html` (viewport-fit=cover, 기본 CSP 메타, `#root`)
- [x] `src/main.tsx`, `src/vite-env.d.ts`
- 📄 산출 경로: 워크스페이스 루트

### Step 2 — 디자인 토큰 & 전역 스타일 (NFR-UI, NFR-WEBVIEW)
- [x] `src/shared/styles/tokens.css` (CSS 변수: color/space/radius/typography — Lo-Fi 기본값)
- [x] `src/shared/styles/global.css` (100dvh, safe-area, overscroll/long-press/tap-highlight 비활성)
- [x] tailwind theme를 토큰에 매핑

### Step 3 — 도메인 타입 (계약) — domain-entities.md
- [x] `src/domain/types/auth.ts` (AppSession, AuthStatus, AuthProvider)
- [x] `src/domain/types/onboarding.ts` (Gender, OnboardingProfile, OnboardingState)
- [x] `src/domain/types/permission.ts` (PermissionType, PermissionStatus)
- [x] `src/domain/types/course.ts` (Region, Course)
- [x] `src/domain/types/gate.ts` (GateAction)
- [x] `src/domain/types/shared.ts` (SharePayload, RunResult placeholder)
- [x] `src/domain/types/index.ts` (배럴) + `src/domain/constants.ts` (DEFAULT_REGION_CODE, 자릿수/범위 상수)

### Step 4 — 도메인 순수 로직 — business-rules.md (PBT 대상)
- [x] `src/domain/logic/profileValidation.ts` (isValidHeight/Weight, isHeight/WeightInRange, isProfileComplete)
- [x] `src/domain/logic/sessionLogic.ts` (nextAuthStatus)
- [x] `src/domain/logic/gateRules.ts` (isAllowed)
- [x] `src/domain/logic/regionLogic.ts` (resolveDefaultRegion)
- [x] `src/domain/logic/index.ts`

### Step 5 — 도메인 로직 테스트 (PBT-10: property + example)
- [x] `src/shared/testing/arbitraries.ts` (공용 fast-check 생성기)
- [x] `src/domain/logic/profileValidation.test.ts`
- [x] `src/domain/logic/sessionLogic.test.ts`
- [x] `src/domain/logic/gateRules.test.ts`
- [x] `src/domain/logic/regionLogic.test.ts`
- [x] `src/test/setup.ts` (testing-library/jest-dom, fast-check seed 설정)

### Step 6 — Repository 인터페이스 (계약만, 구현은 U1~)
- [x] `src/domain/repositories/AuthRepository.ts`
- [x] `src/domain/repositories/CourseRepository.ts`
- [x] `src/domain/repositories/RegionRepository.ts`
- [x] `src/domain/repositories/OnboardingRepository.ts`
- [x] `src/domain/repositories/index.ts`

### Step 7 — env config & 보안 메타 (P-3, P-4)
- [x] `src/shared/config/env.ts` (VITE_* 파싱 단일 출처: API base, ENABLE_MSW, FORCE_MOCK_BRIDGE)
- [x] `.env.example`

### Step 8 — 에러 경계 & 공용 UI 골격 (P-1)
- [x] `src/app/GlobalErrorBoundary.tsx`
- [x] `src/app/RouteErrorBoundary.tsx`
- [x] `src/shared/ui/` 최소 토큰 기반 요소(Button/Spinner 등 골격, data-testid 포함)
- (AsyncBoundary는 U3에서 구현 — 본 단계 제외)

### Step 9 — 앱 셸 / 라우팅 / 탭바 (business-logic-model §5)
- [x] `src/app/SafeAreaLayout.tsx`
- [x] `src/app/BottomTabBar.tsx` (메인/기록/마이페이지 골격, data-testid; 게이트 연동은 U1)
- [x] `src/app/AppRouter.tsx` (라우트 골격 + 플레이스홀더 화면)
- [x] `src/app/AppRoot.tsx` (Providers: QueryClientProvider/Router + GlobalErrorBoundary; queryClient retry 정책 P-2)
- [x] `src/app/placeholders/` (Main/Records/MyPage/Onboarding 임시 화면 — 후속 단위서 대체)

### Step 10 — 문서 요약 (aidlc-docs)
- [x] `aidlc-docs/construction/u0-foundation/code/u0-code-summary.md` (생성 파일 목록 + 매핑)

---

## 스토리 추적
- U0는 직접 스토리 없음. 본 단계 산출물은 후속 단위 스토리의 **전제 토대**로 추적됨(unit-of-work-story-map.md U0 항목).
- PBT property 11종(business-logic-model §4) → Step 5 테스트로 구현.

## 범위 밖 (후속 단위)
- apiClient/MSW 핸들러 실구현, bridgeAdapter/mockBridge/BridgeService, sessionStore/SessionService, AsyncBoundary, 실제 화면(Login/V01/V02) → U1~U3.
