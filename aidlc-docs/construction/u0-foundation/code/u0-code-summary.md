# U0 Foundation — Code Generation Summary

> CONSTRUCTION / Code Generation 산출물 요약 (단위: U0). 실제 코드는 워크스페이스 루트에 생성됨.
> 검증 결과: **typecheck ✓ · 테스트 24/24 ✓ · build ✓(gzip JS 92.23KB) · lint ✓**.

---

## 1. 생성 파일 (워크스페이스 루트)

### 프로젝트 설정 (Step 1)
- `package.json` (pnpm, React19/TS/Vite/Tailwind/Router/Query/Zustand + 테스트/린트 devDeps)
- `tsconfig.json` (strict + noUncheckedIndexedAccess/exactOptionalPropertyTypes 등, 단일 구성)
- `vite.config.ts` · `vitest.config.ts` (jsdom, setup, fast-check seed)
- `tailwind.config.ts` · `postcss.config.js`
- `.eslintrc.cjs` · `.prettierrc` · `.nvmrc` · `.env.example`
- `index.html` (viewport-fit=cover, 기본 CSP)
- `src/main.tsx` · `src/vite-env.d.ts`

### 디자인 토큰/스타일 (Step 2)
- `src/shared/styles/tokens.css` (CSS 변수 — 색/간격/반경/타이포)
- `src/shared/styles/global.css` (100dvh, safe-area, overscroll/long-press/tap-highlight 비활성)

### 도메인 타입 (Step 3)
- `src/domain/types/{auth,onboarding,permission,course,gate,shared}.ts` + `index.ts`
- `src/domain/constants.ts` (DEFAULT_REGION_CODE, 자릿수/범위 상수)

### 도메인 순수 로직 (Step 4)
- `src/domain/logic/{profileValidation,sessionLogic,gateRules,regionLogic}.ts` + `index.ts`

### 테스트 (Step 5) — PBT + example 병행
- `src/test/setup.ts` (jest-dom, fast-check numRuns 100 + FC_SEED)
- `src/shared/testing/arbitraries.ts` (공용 생성기)
- `src/domain/logic/{profileValidation,sessionLogic,gateRules,regionLogic}.test.ts`

### Repository 인터페이스 (Step 6, 계약만)
- `src/domain/repositories/{AuthRepository,CourseRepository,RegionRepository,OnboardingRepository}.ts` + `index.ts`

### env/보안 (Step 7)
- `src/shared/config/env.ts`

### 에러 경계/공용 UI (Step 8)
- `src/app/GlobalErrorBoundary.tsx` · `src/app/RouteErrorBoundary.tsx`
- `src/shared/ui/{Button,Spinner}.tsx` + `index.ts`

### 앱 셸/라우팅/탭바 (Step 9)
- `src/shared/api/queryClient.ts` (retry 정책 P-2)
- `src/app/{SafeAreaLayout,BottomTabBar,AppRouter,AppRoot}.tsx`
- `src/app/placeholders/PlaceholderScreen.tsx`

---

## 2. 스토리 추적
- U0는 직접 스토리 없음(토대). 후속 단위 스토리의 전제.
- PBT property 11종(business-logic-model §4) → 테스트 24개로 구현(property + example 병행).

## 3. 검증 명령
```
pnpm install
pnpm typecheck   # 통과
pnpm test        # 24 passed
pnpm build       # 성공, dist/assets js gzip 92.23KB (<300KB 목표 충족)
pnpm lint        # 통과
```

## 4. 의도적 단순화/점진 도입 (Q3=B)
- 본 단계 미구현(후속 단위): apiClient 실구현·MSW 핸들러, bridgeAdapter/mockBridge/BridgeService, sessionStore/SessionService, AsyncBoundary, 실제 화면(Login/V01/V02).
- 화면은 PlaceholderScreen 골격으로 대체(라우팅/탭바 동작 확인용).
- tsconfig는 project references 대신 단일 구성으로 단순화(`tsc --noEmit`).

## 5. Extension Compliance — U0 Code Generation
- **PBT-10**: example + property 병행 구현 ✓ / **PBT-08**: numRuns 100 + FC_SEED 시드 고정 ✓ / **PBT-01**: property 11종 구현 ✓
- **SECURITY-05**: profileValidation 하드 검증 + 테스트 ✓ / **SECURITY-08**: gateRules + 테스트 ✓ / **SECURITY-12**: AppSession 토큰 미포함, 저장소 미사용 ✓ / **SECURITY-04**: index.html 기본 CSP ✓
- 블로킹 없음.
