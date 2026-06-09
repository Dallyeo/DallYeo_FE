# U1 Login — Code Generation Summary

> 검증: **typecheck ✓ · 테스트 45/45 ✓ · build ✓(gzip JS 95.43KB) · lint ✓**.

## 생성 파일 (워크스페이스 루트)
### 브릿지 (Step 1)
- `src/shared/bridge/{types.ts, bridgeAdapter.ts, mockBridge.ts, index.ts}`
### API (Step 2)
- `src/shared/api/apiClient.ts` (토큰 클로저 캡슐화 · Bearer · 401 콜백+ApiError)
### 인증 인프라 (Step 3)
- `src/shared/observability/logger.ts`
- `src/shared/services/BridgeService.ts` (지연 어댑터 해석)
- `src/shared/auth/sessionStore.ts` (Zustand 단일 출처)
- `src/shared/auth/SessionService.ts` (구독 수명주기 · 무효화 1회 가드)
- `src/shared/ui/toastStore.ts` · `src/shared/ui/ToastHost.tsx`
### Repository (Step 4)
- `src/features/login/api/authRepository.ts`
### model (Step 5)
- `src/features/login/model/{loginSheetStore.ts, useAuth.ts, useGate.ts, useLoginSheet.ts}`
### UI (Step 6)
- `src/shared/ui/BottomSheet.tsx`
- `src/features/login/ui/{ProviderButton.tsx, LoginErrorNotice.tsx, LoginBottomSheet.tsx, LoginBottomSheetHost.tsx}`
### 통합 (Step 7)
- `src/app/RootLayout.tsx` (SessionService 기동 + 시트/토스트 호스트)
- `src/app/AppRouter.tsx` (RootLayout 루트 적용)
### 테스트 (Step 8, example 중심)
- `src/shared/api/apiClient.test.ts` · `src/shared/auth/SessionService.test.ts`
- `src/features/login/model/loginSheetStore.test.ts` · `useGate.test.tsx`
- `src/shared/bridge/mockBridge.test.ts` · `src/features/login/ui/LoginBottomSheet.test.tsx`

## 스토리 추적
- LOGIN-S1(시트/게이트 메커니즘) ✓ / LOGIN-S2(Kakao·Apple) ✓ / LOGIN-S4(무효화) ✓
- LOGIN-S3(마이페이지 배너) → U3 (FD Q6=C)
- 게이트 트리거(기록 탭/마이페이지 항목) 실제 연결 → U3

## 설계 반영
- 토큰 분리(Q1): bridge.login {session, token} → token=apiClient 클로저, session=store
- 로그인 후 재개(Q2): loginSheetStore pendingAction → 성공 시 recordsTab 라우팅(나머지 U3)
- 취소/실패 구분(Q3) · mock 토글(Q4) · SessionService 단일 조율(Q5)
- 동시성: useAuth in-flight 단일화

## Compliance — U1 Code Gen
- SECURITY-12: 토큰 클로저(getter 없음), localStorage 미사용 ✓
- SECURITY-11: sessionStore/SessionService 단일 ✓ / SECURITY-08: gateRules 재사용 ✓
- SECURITY-03: logger 민감정보 미로깅 ✓
- PBT-10: example 기반(Q3=B), 도메인 property는 U0 ✓
- 블로킹 없음.
