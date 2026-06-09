# U1 Login — Business Rules

> CONSTRUCTION / Functional Design 산출물 (단위: U1).
> 답변: Q1=A(토큰 분리) · Q2=B(액션 재개) · Q3=A(취소/실패 구분) · Q4=A(mock 토글) · Q5=A(SessionService 단일 조율) · Q6=C(마이페이지 U3).

---

## BR-U1-1. 로그인 흐름 (LOGIN-S2, FR-LOGIN-01/05)
1. 사용자가 Kakao/Apple 버튼 탭 → `useAuth.login(provider)`.
2. `AuthRepository.login(provider)` → `BridgeService.login` → `bridge.login(provider)` (웹은 OAuth 직접 수행 금지, NFR-AUTH-01).
3. 성공 시 `BridgeLoginResult { session, token }` 수신:
   - `apiClient.setToken(token)` (메모리, SECURITY-12)
   - `sessionStore`: status=authenticated, session 저장
   - 로그인 시트 close
   - **pendingAction 있으면 재개**(Q2=B) — BR-U1-3 참조
4. 제공자 버튼은 Kakao/Apple만 노출(google 없음).

## BR-U1-2. 로그인 실패/취소 구분 (LOGIN-S2, Q3=A)
- `BridgeError.kind === 'cancelled'`: **조용히 처리** — 시트 유지, 에러 토스트 없음, LoginPhase=idle, 재시도 가능.
- `kind === 'failed' | 'timeout'`: **에러 안내** "로그인에 실패했어요. 다시 시도해 주세요" + 재시도 버튼, LoginPhase=error. 토큰/세션 상태 불변.

## BR-U1-3. 게이트 + 로그인 재개 (LOGIN-S1, Q2=B)
1. 게이트 액션 시도 → `useGate.guard(action)`:
   - `isAllowed(status, action)===true` → 액션 진행, true 반환.
   - false → `loginSheetStore.open(action)` (pendingAction=action), 중복 시트 방지, false 반환.
2. 시트 열림 중 다른 게이트 액션 → 중복 시트 안 쌓임(단일 시트), pendingAction은 최초/최신 정책: **최신 액션으로 갱신**.
3. 로그인 성공 시 pendingAction이 있으면 **그 액션을 재개**:
   - 'recordsTab' → 기록(V11) 라우팅
   - 'myPageProfile/EditInfo/Account' → 해당 항목 동작 재개 (실제 항목은 U3에서 연결)
   - 'saveRunResult' → 저장 재시도(V10 라운드)
   - 재개 후 pendingAction=null.
4. 시트를 사용자가 닫으면(뒤로/바깥 탭) pendingAction=null, 재개 없음.

## BR-U1-4. 세션 무효화 단일 조율 (LOGIN-S4, FR-LOGIN-06, Q5=A)
- 트리거: `apiClient` 401 OR `bridge.on('sessionChanged', logout)`.
- **SessionService가 유일 조율자**:
  1. `nextAuthStatus(current, 'expire'|'logout')` → unauthenticated 전이.
  2. **상태가 실제로 authenticated/unknown→unauthenticated로 바뀔 때만 1회** 부수효과: `apiClient.setToken(null)` + V02 라우팅 + "로그아웃되었습니다" 토스트.
  3. 이미 unauthenticated면 부수효과 생략(중복 가드) → 401+sessionChanged 동시 도착해도 1회.
- 컴포넌트는 sessionStore만 구독(부수효과 직접 처리 금지).

## BR-U1-5. 부트스트랩 세션 복원
- 앱 시작(AppRoot) 시 SessionService.bootstrap:
  1. `AuthRepository.getCurrentSession()`(네이티브 주입 조회).
  2. 있으면 token/session 주입 + status=authenticated('resolveExists').
  3. 없으면 status=unauthenticated('resolveAbsent').
- 부트스트랩 완료 전 status='unknown' — 게이트는 차단 측(BR-3, U0).
- 이후 `bridge.on('sessionChanged')` 단일 구독 등록(NFR-AUTH-03).

## BR-U1-6. Mock 브릿지 동작 (브라우저, Q4=A)
- 디바이스 부재(또는 VITE_FORCE_MOCK_BRIDGE) → mockBridge 사용.
- `login`: 기본 **성공**(가짜 AppSession+token 반환). 시나리오 토글(URL 쿼리/설정)로:
  - cancel 모드 → `BridgeError{kind:'cancelled'}`
  - fail 모드 → `BridgeError{kind:'failed'}`
- `logout`: 성공 resolve. `getCurrentSession`: 기본 null(비로그인 시작).
- 모든 호출은 실제처럼 비동기(promise) 응답(NFR-BRIDGE-03).

## BR-U1-7. 브릿지 호출 회복력 (P-2)
- bridgeAdapter: request-id + promise registry. **10s 타임아웃** 후 `BridgeError{kind:'timeout'}` reject + registry 정리(누수 방지). 자동 재시도 없음.

---

## 예외 처리 요약
| 상황 | 규칙 |
|---|---|
| 로그인 취소 | 조용히 시트 유지(BR-U1-2) |
| 로그인 실패/타임아웃 | 에러 안내 + 재시도, 상태 불변(BR-U1-2/7) |
| 401 + sessionChanged 동시 | 무효화 1회만(BR-U1-4) |
| 부트스트랩 중 게이트 시도 | unknown=차단 측 처리 |
| 디바이스 없음 | mock 브릿지로 전 분기 미리보기(BR-U1-6) |
