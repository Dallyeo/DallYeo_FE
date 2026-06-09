# U1 Login — Logical Components (NFR)

> CONSTRUCTION / NFR Design 산출물 (단위: U1). NFR을 실현하는 논리 컴포넌트.

---

## 1. 컴포넌트 목록
| 컴포넌트 | 위치(예정) | NFR 책임 | 패턴 |
|---|---|---|---|
| `apiClient` | `shared/api/apiClient.ts` | 토큰 클로저 캡슐화, Bearer 주입, 401 콜백+throw | U1-P1/P2 |
| `bridgeAdapter` | `shared/bridge/bridgeAdapter.ts` | request-id registry, 10s 타임아웃 | U1-P6 |
| `mockBridge` | `shared/bridge/mockBridge.ts` | 분기 토글(성공/취소/실패) | P-3 |
| `BridgeService` | `shared/services/BridgeService.ts` | 이벤트 on/off, login/logout | U1-P3 |
| `sessionStore` | `shared/auth/sessionStore.ts` | 인증 단일 출처(status/session) | U1-P3 |
| `SessionService` | `shared/auth/SessionService.ts` | 구독 수명주기, 무효화 1회 가드 | U1-P3/P4 |
| `logger` | `shared/observability/logger.ts` | 콘솔 로깅(민감정보 미로깅), 원격 sink 자리 | U1-P8 |
| `useAuth` | `features/login/model/useAuth.ts` | login 단일화(in-flight) | U1-P5 |
| `BottomSheet` | `shared/ui/BottomSheet.tsx` | history 엔트리 시트 | U1-P7 |

## 2. 상호작용 (NFR 관점)
```
AppRoot effect
  -> SessionService.start()
       bridge.on('sessionChanged') [1회]   (U1-P3)
       apiClient.onUnauthorized(invalidate) (U1-P2)
       bootstrap()
  -> cleanup: 구독 해제 (Unsubscribe)

API 401 ─> apiClient onUnauthorized ─> SessionService.invalidate (1회 가드, U1-P4)
sessionChanged(logout) ─────────────┘

useAuth.login(p): in-flight 있으면 재사용; 없으면 생성 (U1-P5)
```

## 3. 장애/회복 시나리오
| 시나리오 | 컴포넌트 | 결과 |
|---|---|---|
| 401 응답 | apiClient→SessionService | 무효화 1회 + 토스트 |
| sessionChanged logout | BridgeService→SessionService | 무효화 1회(중복 가드) |
| 브릿지 무응답 | bridgeAdapter 10s | timeout reject → 로그인 실패 안내 |
| 로그인 연타 | useAuth | 단일 promise, 중복 무시 |
| 디바이스 없음 | bridgeResolver→mockBridge | 전 분기 미리보기 |

## 4. 검증
- [x] U1 패턴(U1-P1~P8) 컴포넌트 대응
- [x] 단일 구독/단일 출처/1회 가드 반영
- [x] 인프라성 컴포넌트 N/A
- [x] Mermaid 미사용(텍스트)
