# U1 Login — Domain Entities (보강분)

> CONSTRUCTION / Functional Design 산출물 (단위: U1). U0 도메인 타입에 더해 U1이 도입하는 계약/전송 타입.
> 답변 반영: Q1=A(토큰 분리), Q6=C(마이페이지 U3 위임).

---

## 1. 재사용 (U0)
- `AppSession`, `AuthStatus`, `AuthProvider`, `GateAction` (domain/types)
- `nextAuthStatus`, `isAllowed` (domain/logic)

## 2. U1 신규 전송/계약 타입

### 브릿지 전송 타입 (shared/bridge — **도메인 아님**)
| 타입 | 정의 | 비고 |
|---|---|---|
| `BridgeLoginResult` | `{ session: AppSession; token: string }` | Q1=A. token은 apiClient 메모리로, session은 sessionStore로 분리. 도메인 AppSession은 토큰 미포함 유지(SECURITY-12) |
| `BridgeEvent` | `'runCompleted' \| 'runCancelled' \| 'permissionChanged' \| 'sessionChanged'` | 네이티브→웹 이벤트명 |
| `SessionChangedPayload` | `{ status: 'authenticated' \| 'unauthenticated'; session?: AppSession; token?: string }` | sessionChanged 페이로드. logout 시 status=unauthenticated |
| `BridgeError` | `{ kind: 'cancelled' \| 'failed' \| 'timeout'; message?: string }` | Q3=A 분기용 |

### 인증 상태 스토어 모델 (application — Zustand)
| 타입 | 필드 |
|---|---|
| `SessionState` | `status: AuthStatus` · `session: AppSession \| null` |
| `LoginSheetState` | `isOpen: boolean` · `pendingAction: GateAction \| null` (Q2=B 재개용) |

### 로그인 UI 상태
| 타입 | 값 |
|---|---|
| `LoginPhase` | `'idle' \| 'pending' \| 'error'` (취소는 idle로 복귀, 실패는 error — Q3=A) |

## 3. 관계
```
bridge.login(provider) -> BridgeLoginResult { session, token }
   token -> apiClient.setToken (메모리)
   session -> sessionStore.session ; status=authenticated
sessionChanged(SessionChangedPayload) -> SessionService -> sessionStore (+token)
LoginSheetState.pendingAction -> 로그인 성공 시 재개 대상 (Q2=B)
```

## 4. 스토리맵 조정 (Q6=C)
- **LOGIN-S3(마이페이지 "로그인하세요" 배너)** → U1에서 제외, **U3로 재배정**(마이페이지 탭 연결 시점).
- U1 구현 스토리: LOGIN-S1(게이트 메커니즘), LOGIN-S2, LOGIN-S4. 게이트 **트리거 지점**(기록 탭/마이페이지 항목) 연결은 U3(V02-S2).
- 본 조정은 `unit-of-work-story-map.md`에 주석으로 반영.
