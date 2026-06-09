# U1 Login — Business Logic Model

> CONSTRUCTION / Functional Design 산출물 (단위: U1). 인증 인프라 + 로그인 로직 모델.

---

## 1. 컴포넌트/모듈 (예정 위치)

| 모듈 | 위치 | 책임 |
|---|---|---|
| `bridgeAdapter` | `shared/bridge/bridgeAdapter.ts` | window.DallYeoBridge 접근, request-id+promise registry, 10s 타임아웃 |
| `mockBridge` | `shared/bridge/mockBridge.ts` | 브라우저용 mock(login 성공/취소/실패 토글) |
| `bridgeResolver` | `shared/bridge/index.ts` | 실 어댑터 vs mock 자동 감지/주입 |
| `BridgeService` | `shared/services/BridgeService.ts` | login/logout/getCurrentSession + on(event) + (화면전환·디바이스는 U3) |
| `apiClient` | `shared/api/apiClient.ts` | fetch 래퍼, Bearer 자동주입, 401→onUnauthorized, setToken(메모리) |
| `sessionStore` | `shared/auth/sessionStore.ts` | Zustand: status, session (인증 단일 출처) |
| `SessionService` | `shared/auth/SessionService.ts` | bootstrap + sessionChanged 단일구독 + 무효화 1회 조율 |
| `loginSheetStore` | `features/login/model/loginSheetStore.ts` | isOpen, pendingAction (Q2=B) |
| `useAuth` | `features/login/model/useAuth.ts` | status/session + login/logout |
| `useGate` | `features/login/model/useGate.ts` | guard(action) |
| `useLoginSheet` | `features/login/model/useLoginSheet.ts` | open/close 상태 |
| `AuthRepositoryImpl` | `features/login/api/authRepository.ts` | AuthRepository 구현(BridgeService 위임) |

---

## 2. 로그인 시퀀스 (텍스트)
```
LoginBottomSheet[Kakao] -> useAuth.login('kakao')
  -> AuthRepositoryImpl.login -> BridgeService.login -> bridgeAdapter.invoke('login',{provider})
     (실패/취소 -> BridgeError -> LoginPhase error/idle, BR-U1-2)
  -> BridgeLoginResult{session,token}
  -> apiClient.setToken(token); sessionStore.set(authenticated, session)
  -> loginSheetStore.close(); pendingAction 있으면 재개(Q2=B)
```

## 3. 세션 상태/무효화 (텍스트)
```
[bootstrap]
AppRoot -> SessionService.bootstrap
  -> AuthRepository.getCurrentSession
     exists -> setToken + sessionStore(authenticated) [event resolveExists]
     absent -> sessionStore(unauthenticated) [event resolveAbsent]
  -> bridge.on('sessionChanged') 단일 구독

[invalidate] (BR-U1-4, 1회 가드)
401  ───┐
        ├─> SessionService.invalidate
sessionChanged(logout) ─┘
   if status != unauthenticated:
     nextAuthStatus(...,'expire'|'logout') -> unauthenticated
     apiClient.setToken(null); navigate('/main'); toast('로그아웃되었습니다')
   else: no-op
```

## 4. 게이트 + 재개 (텍스트)
```
guard(action):
  isAllowed(sessionStore.status, action) ?
    true  -> 진행
    false -> loginSheetStore.open(action)  // pendingAction=action, 단일 시트
login success -> if pendingAction: resume(pendingAction); pendingAction=null
sheet dismissed -> pendingAction=null
```

## 5. 재사용 순수 로직 (U0) & 신규 테스트 대상
| 로직 | 출처 | U1 테스트 |
|---|---|---|
| nextAuthStatus | U0 | SessionService 무효화 가드 테스트에서 활용 |
| isAllowed | U0 | useGate 분기 테스트 |
| (신규) loginSheet reducer | U1 | open/close/pendingAction 멱등·재개 — **PBT 후보** |
| (신규) invalidate 가드 | U1 | 중복 신호 1회 효과 — example + 상태 기반 테스트 |

> PBT 후보: loginSheetStore 전이(open(a)→open(b)→close 시 pendingAction 규칙), invalidate 멱등(중복 호출 1회 효과). 구현/세부는 Code Generation.

## 6. 통합 지점
- apiClient ↔ SessionService(401 콜백)
- BridgeService ↔ SessionService(sessionChanged)
- useGate ↔ sessionStore + gateRules + loginSheetStore
- 게이트 **트리거**(기록 탭/마이페이지 항목) 실제 연결 → **U3**(Q6=C)
