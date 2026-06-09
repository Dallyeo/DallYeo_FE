# U1 Login — NFR Design Patterns

> CONSTRUCTION / NFR Design 산출물 (단위: U1). U0 패턴(P-1~P-6) 상속 + U1 인증 패턴.
> 답변: Q1=A(401 콜백+throw) · Q2=A(SessionService 1회 구독/해제) · Q3=A(로그인 단일화).

---

## U1-P1. 토큰 캡슐화 패턴 (SECURITY-12, Q1 NFR-Req)
- apiClient 모듈 스코프 `let token: string | null`. 노출: `setToken(t)`, `clearToken()`, 내부 `authHeader()`.
- 토큰 값 getter 미제공 → 컴포넌트/스토어가 토큰 직접 접근 불가.

## U1-P2. 401 인터셉트 패턴 (Q1=A, BR-U1-4)
```
apiClient.request():
  res = fetch(...)
  if res.status === 401:
     onUnauthorized?.()          // SessionService가 등록한 콜백 → 세션 무효화 조율
     throw new ApiError(401)
  if !res.ok: throw new ApiError(status)
  return parsed
```
- 세션 무효화(라우팅/토스트)는 콜백 경로(SessionService), 호출부는 일반 에러로 처리(관심사 분리).

## U1-P3. 세션 단일 출처 + 구독 수명주기 (Q2=A, NFR-AUTH-03)
- `SessionService`: 부트스트랩(AppRoot effect)에서 `bridge.on('sessionChanged')` **1회 구독** + `apiClient.onUnauthorized` 등록. 언마운트 시 해제(Unsubscribe).
- 컴포넌트는 `sessionStore`만 구독. 무효화 부수효과는 SessionService가 1회 가드.

## U1-P4. 무효화 1회 가드 패턴 (BR-U1-4)
```
invalidate(reason):
  if sessionStore.status === 'unauthenticated': return  // 멱등
  sessionStore.set(unauthenticated); apiClient.clearToken()
  navigate('/main'); toast('로그아웃되었습니다')
```

## U1-P5. 로그인 동시성 단일화 패턴 (Q3=A)
- `useAuth.login`: in-flight promise를 모듈/스토어에 보관. 진행 중이면 동일 promise 반환(중복 brige.login 방지). 버튼 pending 비활성 병행.

## U1-P6. 브릿지 회복력 (상속 P-2)
- bridgeAdapter request-id+registry, 10s 타임아웃 reject + 정리.

## U1-P7. 시트 history 패턴 (상속, NFR-WEBVIEW-04)
- BottomSheet open=pushState, close=back. 좌측 스와이프로 닫힘.

## U1-P8. 관측성 (Q2 NFR-Req)
- `logger` 얇은 래퍼(개발 콘솔). 로그인 성공/실패/만료 이벤트명만 기록, **토큰/세션ID 미로깅**. 원격 sink 주입 자리만.

---

## 상속/적용 요약
| 패턴 | 출처 | U1 적용 |
|---|---|---|
| P-1 에러경계 | U0 | 로그인 시트 에러는 경계 아닌 LoginPhase 상태로(렌더 예외만 경계) |
| P-2 회복력 | U0 | U1-P2/P6 |
| P-3 env토글 | U0 | mock 브릿지 자동 감지 |
| P-4 보안 | U0 | U1-P1/P3 |
| P-6 테스트 | U0 | example 중심(Q3=B NFR-Req) |

## N/A
서버/인프라 패턴 N/A(클라이언트 SPA) — Infrastructure Design SKIP 일관.
