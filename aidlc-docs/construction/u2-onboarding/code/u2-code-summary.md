# U2 Onboarding — Code Generation Summary

> 검증: typecheck ✓ · 테스트 52/52 ✓ · build ✓(gzip 97.26KB) · lint ✓.

## 생성 파일
- `src/shared/services/BridgeService.ts` (수정: requestPermission/getPermissionStatus 추가)
- `src/features/onboarding/api/onboardingRepository.ts` (localStorage + readOnboardingCompleted 헬퍼)
- `src/features/onboarding/model/{onboardingStore.ts, useOnboarding.ts}`
- `src/features/onboarding/ui/{ServiceIntroStep, LocationPermissionStep, BodyInfoStep, OnboardingFlow}.tsx`
- `src/app/AppRouter.tsx` (수정: /onboarding → OnboardingFlow)
- `src/app/RootLayout.tsx` (수정: 미완료 시 /onboarding 리다이렉트 1회)
- 테스트: `onboardingRepository.test.ts`, `useOnboarding.test.tsx`

## 스토리
- V01-S1(1회 표시) ✓ / V01-S2(위치 권한) ✓ / V01-S3(기본정보+검증) ✓ / V01-S4(건너뛰기) ✓

## 설계 반영
- localStorage 영속(비민감) + 폴백 / 하드(자릿수)·소프트(범위) 분리 / 권한 거부 진행 허용 / canSubmit=isProfileComplete
- Compliance: SECURITY-05/12/15 Compliant, PBT-10 example. 블로킹 없음.
