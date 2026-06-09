# U0 Foundation — Business Rules

> CONSTRUCTION / Functional Design 산출물 (단위: U0). 검증/결정 규칙 + 예외.
> 답변 반영: Q1=B(소프트 범위 경고·비차단), Q2=B(키 2~3자리), Q3=A('선택안함'=채워짐), Q4=A('unknown' 시작), Q5=A(군산→첫항목→placeholder), Q6=A(액션 단위 게이트).

---

## BR-1. profileValidation (FR-V01-05/06/09, SECURITY-05)

### BR-1.1 키 검증 (`isValidHeight`)
- **하드(차단)**: 정수 AND 자릿수 2~3 (Q2=B). → 1자리/4자리+/비정수/공백 = invalid.
- **소프트(경고, 비차단)**: 50 ≤ heightCm ≤ 250 벗어나면 경고 표시. canSubmit에는 영향 없음 (Q1=B).

### BR-1.2 체중 검증 (`isValidWeight`)
- **하드(차단)**: 정수 AND 자릿수 2~3 (FR-V01-06). → 1자리/4자리+/비정수 = invalid.
- **소프트(경고, 비차단)**: 20 ≤ weightKg ≤ 300 벗어나면 경고. canSubmit 무관 (Q1=B).

### BR-1.3 성별 (`Gender`)
- 4옵션 중 택1. `'unspecified'`(선택안함)도 **명시적 선택 = 채워진 값**으로 간주 (Q3=A).
- 미선택(undefined)만 "빈 값".

### BR-1.4 입력 완료 (`isProfileComplete`) → 입력완료 버튼 활성 (FR-V01-09)
- **참 조건**: heightCm가 BR-1.1 하드 통과 AND weightKg가 BR-1.2 하드 통과 AND gender !== undefined.
- 소프트 경고 존재 여부는 **무관**(경고 있어도 complete 가능, Q1=B).
- 하나라도 비거나 하드 invalid면 false → 버튼 비활성.

### BR-1.5 입력 제한 (UX)
- 키/체중 입력 필드는 비정수 문자 차단, 최대 3자리 초과 입력 차단(타이핑 단계). (FR-V01-05/06)

---

## BR-2. sessionLogic (LOGIN-S4, FR-LOGIN-06)

### BR-2.1 초기 상태
- 앱 시작 시 `AuthStatus = 'unknown'` (Q4=A). 부트스트랩(세션 조회) 후 확정.

### BR-2.2 상태 전이 (`nextAuthStatus(current, event)`)
| 현재 \ 이벤트 | `login` | `logout` | `expire` | `resolveSession(존재)` | `resolveSession(없음)` |
|---|---|---|---|---|---|
| unknown | authenticated | unauthenticated | unauthenticated | authenticated | unauthenticated |
| authenticated | authenticated | unauthenticated | unauthenticated | authenticated | unauthenticated |
| unauthenticated | authenticated | unauthenticated | unauthenticated | authenticated | unauthenticated |

- **멱등**: 같은 결과 상태로 가는 이벤트 반복 시 상태 불변.
- **무효화 중복 가드**: 401 + sessionChanged(logout) 동시 도착 → 전이는 1회만 의미 있음(unauthenticated 고정). 부수효과(라우팅/토스트)는 application 계층에서 1회 가드 (LOGIN-S4).

### BR-2.3 무효화 부수효과 (application 계층 규칙, 참고)
- authenticated/unknown → unauthenticated 전이 시: 토큰 메모리 클리어 + V02 라우팅 + "로그아웃되었습니다" 토스트 1회.

---

## BR-3. gateRules (FR-V02-03/04, SECURITY-08)

### BR-3.1 액션 단위 허용 규칙 (`isAllowed(status, action)`) — Q6=A
| GateAction | authenticated | unauthenticated | unknown |
|---|---|---|---|
| `myPageTab` | 허용 | **허용** | 허용 |
| `recordsTab` | 허용 | 차단 | 차단 |
| `myPageProfile` | 허용 | 차단 | 차단 |
| `myPageEditInfo` | 허용 | 차단 | 차단 |
| `myPageAccount` | 허용 | 차단 | 차단 |
| `saveRunResult` | 허용 | 차단 | 차단 |

- `unknown`은 안전하게 **차단 측**(비로그인처럼) 처리 (Q4=A). 단 myPageTab 진입 자체는 항상 허용.
- 차단 시 application 계층이 로그인 바텀시트 오픈(중복 방지).
- **이중 방어**: 클라이언트 차단과 별개로 서버도 인가 검증(SECURITY-08).

---

## BR-4. regionLogic (FR-V02-08)

### BR-4.1 기본 지역 해석 (`resolveDefaultRegion(regions)`) — Q5=A
1. `regions`에 code === `DEFAULT_REGION_CODE`('gunsan')가 있으면 그것.
2. 없고 목록이 비어있지 않으면 첫 항목.
3. 목록이 비어 있으면 안전한 placeholder `{ code: 'gunsan', name: '군산' }` 반환(앱이 깨지지 않게).

### BR-4.2 불변식
- 반환값은 항상 유효한 `Region`(null/undefined 아님).
- 목록에 군산이 있으면 항상 군산을 반환(다른 항목보다 우선).

---

## 예외 처리 요약
| 상황 | 규칙 |
|---|---|
| 키/체중 비정수·자릿수 위반 | 하드 invalid → 입력 차단 + 버튼 비활성 |
| 키/체중 범위 밖 | 소프트 경고만(제출 허용) |
| 세션 무효화 중복 신호 | 상태 1회 확정 + 부수효과 1회 |
| 지역 목록 비어있음/군산 부재 | placeholder/첫항목으로 안전 폴백 |
