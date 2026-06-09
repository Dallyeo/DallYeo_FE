# U2 Onboarding — Code Generation Plan (자동승인)

> 단위: U2. 코드=워크스페이스 루트 src/. 스토리: V01-S1~S4.

## 단계
### Step 1 — 브릿지 확장
- [x] BridgeService에 requestPermission/getPermissionStatus 추가 (mockBridge는 이미 granted 반환)
### Step 2 — Repository
- [x] `src/features/onboarding/api/onboardingRepository.ts` (localStorage, async 구현 + sync 헬퍼)
### Step 3 — model
- [x] `src/features/onboarding/model/onboardingStore.ts` (step, raw inputs)
- [x] `src/features/onboarding/model/useOnboarding.ts` (검증/권한/완료/건너뛰기)
### Step 4 — UI
- [x] `src/features/onboarding/ui/{ServiceIntroStep,LocationPermissionStep,BodyInfoStep,OnboardingFlow}.tsx`
### Step 5 — 라우팅/가드
- [x] AppRouter /onboarding → OnboardingFlow
- [x] RootLayout: 미완료 시 /onboarding 리다이렉트(1회)
### Step 6 — 테스트
- [x] onboardingRepository.test.ts (round-trip/completed)
- [x] useOnboarding.test.tsx (전이/canSubmit/skip/complete)
### Step 7 — 문서요약
- [x] u2-code-summary.md
