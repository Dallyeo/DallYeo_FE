# U1 Login — Code Generation Plan

> CONSTRUCTION / Code Generation **Part 1 (Planning)** — 단위: U1 Login. (자동승인 모드)
> 단일 진실 원천. 코드 위치: 워크스페이스 루트 `src/`. 문서 요약만 `aidlc-docs/construction/u1-login/code/`.

## 단위 컨텍스트
- 구현 스토리: LOGIN-S1(게이트 메커니즘) · LOGIN-S2(Kakao/Apple) · LOGIN-S4(세션 만료). (LOGIN-S3→U3)
- 도입 인프라(shared/): bridge(adapter/mock/resolver/BridgeService) · apiClient(토큰 클로저/401) · sessionStore+SessionService · logger · Toast.
- U0 재사용: sessionLogic, gateRules, domain.types, AppRoot/Router.

## 실행 단계
### Step 1 — 브릿지 레이어
- [x] `src/shared/bridge/types.ts` (BridgeLoginResult, BridgeEvent, SessionChangedPayload, BridgeError, BridgeAdapter)
- [x] `src/shared/bridge/bridgeAdapter.ts` (request-id registry + 10s 타임아웃)
- [x] `src/shared/bridge/mockBridge.ts` (login 성공/취소/실패 토글)
- [x] `src/shared/bridge/index.ts` (resolver: 실 어댑터 vs mock 자동 감지)

### Step 2 — API 클라이언트
- [x] `src/shared/api/apiClient.ts` (토큰 클로저, Bearer, 401 onUnauthorized+throw, ApiError)

### Step 3 — 인증 인프라
- [x] `src/shared/observability/logger.ts` (콘솔 + sink 자리, 민감정보 미로깅)
- [x] `src/shared/services/BridgeService.ts` (login/logout/getCurrentSession/on)
- [x] `src/shared/auth/sessionStore.ts` (Zustand: status/session)
- [x] `src/shared/auth/SessionService.ts` (start/bootstrap/invalidate 1회 가드, 구독 수명주기)
- [x] `src/shared/ui/toastStore.ts` + `src/shared/ui/ToastHost.tsx`

### Step 4 — Auth Repository 구현
- [x] `src/features/login/api/authRepository.ts` (AuthRepository: BridgeService 위임, 토큰/세션 분리 주입)

### Step 5 — Login feature model
- [x] `src/features/login/model/loginSheetStore.ts` (isOpen, pendingAction)
- [x] `src/features/login/model/useAuth.ts` (login 단일화/logout)
- [x] `src/features/login/model/useGate.ts` (guard + 시트 오픈)
- [x] `src/features/login/model/useLoginSheet.ts`

### Step 6 — Login feature UI
- [x] `src/shared/ui/BottomSheet.tsx` (history 엔트리)
- [x] `src/features/login/ui/ProviderButton.tsx`
- [x] `src/features/login/ui/LoginErrorNotice.tsx`
- [x] `src/features/login/ui/LoginBottomSheet.tsx`
- [x] `src/features/login/ui/LoginBottomSheetHost.tsx`

### Step 7 — AppRoot 통합
- [x] `src/app/AppRoot.tsx` 수정 (SessionService start effect + LoginBottomSheetHost + ToastHost)
- [x] 게이트 데모용 임시 트리거는 만들지 않음(실제 트리거는 U3). 부트스트랩/시트만 통합.

### Step 8 — 테스트 (example 중심, Q3=B)
- [x] `src/shared/api/apiClient.test.ts` (401→onUnauthorized, Bearer 주입, 토큰 비노출)
- [x] `src/shared/auth/SessionService.test.ts` (무효화 1회 가드, 부트스트랩)
- [x] `src/features/login/model/loginSheetStore.test.ts` (open/close/pendingAction)
- [x] `src/features/login/model/useGate.test.tsx` (게이트 분기 → 시트 오픈)
- [x] `src/shared/bridge/mockBridge.test.ts` (성공/취소/실패 분기)
- [x] `src/features/login/ui/LoginBottomSheet.test.tsx` (버튼 노출/로그인 호출/에러 표시)

### Step 9 — 문서 요약
- [x] `aidlc-docs/construction/u1-login/code/u1-code-summary.md`

## 스토리 추적
- LOGIN-S1(시트/게이트 메커니즘), LOGIN-S2(로그인), LOGIN-S4(무효화) → Step 1~8.
- 트리거 연결(기록 탭/마이페이지) → U3.
