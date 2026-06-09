# U1 Login — Functional Design Plan

> CONSTRUCTION / Functional Design **Plan** (단위: U1 Login).
> 아래 **질문**에 `[Answer]:` 태그로 답해 주세요. 모두 채워지면 분석 후 산출물을 생성합니다.

---

## A. 범위

U1은 **인증 인프라(브릿지·세션·apiClient)를 최초 도입**하는 단위이자, 로그인 스토리 4개를 구현합니다.

- **구현 스토리**: LOGIN-S1(게이트 시 바텀시트) · LOGIN-S2(Kakao/Apple 로그인) · LOGIN-S3(마이페이지 배너) · LOGIN-S4(세션 만료/로그아웃)
- **이 단위에서 도입하는 공통 인프라(shared/)**: bridgeAdapter + mockBridge + BridgeService · sessionStore + SessionService · apiClient(Bearer/401)
- **U0 재사용**: domain.logic(sessionLogic, gateRules), domain.types, app shell, AsyncBoundary 미존재(U3)
- 출력(필수 산출물): `domain-entities.md`(U1 보강분), `business-rules.md`, `business-logic-model.md`, `frontend-components.md`(UI 있음)

> 이미 확정된 사항(질문 안 함): 바텀시트=history 엔트리(NFR-WEBVIEW-04) · OAuth는 bridge.login 위임(NFR-AUTH-01) · 토큰 메모리 보관(SECURITY-12) · 제공자 Kakao/Apple(FR-LOGIN-01) · sessionChanged 단일 구독(NFR-AUTH-03).

---

## B. 질문 (모두 `[Answer]:`에 답해 주세요)

## Question 1 — 토큰 전달 경계 (브릿지 → 웹)
웹은 Bearer 헤더용 토큰이 필요합니다(SECURITY-12: 메모리 보관). `bridge.login`이 토큰을 어떻게 넘길까요?

A) **bridge.login이 `{ session: AppSession, token: string }`를 반환** → AuthRepository가 token은 apiClient(메모리)에, session은 sessionStore에 분리 주입. 도메인 AppSession에는 토큰 미포함 유지 — **추천**
B) AppSession에 token 필드 포함(도메인 타입에 토큰 넣기)
C) 토큰은 sessionChanged 이벤트로만 별도 수신(login 응답엔 세션만)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2 — 게이트 후 로그인 성공 시 동작 (LOGIN-S1)
비로그인 상태로 게이트 액션 시도 → 로그인 바텀시트 → 로그인 성공 후?

A) **시트만 닫고 제자리 유지**(원래 액션 자동 재개 안 함) — 단순/예측가능 — **추천**
B) 기억한 액션 자동 재개(예: 기록 탭 시도였으면 로그인 후 기록으로 이동)
C) 액션별로 다르게(일부만 재개)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3 — 로그인 실패/취소 구분 (LOGIN-S2)
`bridge.login`의 결과를 어떻게 구분 처리할까요?

A) **취소=조용히 시트 유지(에러 토스트 없음) / 실패(네트워크·제공자 오류)=에러 안내 + 재시도** — 두 경우를 구분 — **추천**
B) 취소·실패 동일하게 에러 안내
C) 둘 다 조용히 처리(안내 없음)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4 — Mock 브릿지 로그인 동작 (브라우저 개발용)
브라우저 단독(디바이스 없음)에서 mock 브릿지의 `login`은 어떻게 동작?

A) **기본 성공(가짜 AppSession+token 반환) + URL/설정으로 취소·실패 시나리오 토글 가능** — 모든 분기 미리보기 — **추천**
B) 항상 성공만
C) 매번 콘솔/프롬프트로 결과 선택
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5 — 세션 만료 토스트/라우팅 트리거 위치 (LOGIN-S4)
401과 sessionChanged(logout)가 동시에 와도 부수효과(라우팅+토스트)는 1회. 어디서 조율?

A) **SessionService가 단일 조율자** — 상태 전이 시 1회 가드로 라우팅+토스트 트리거(컴포넌트는 sessionStore만 구독) — **추천**
B) 각 화면이 sessionStore 변화를 보고 개별 처리
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6 — 마이페이지 배너/게이트 항목 구현 범위 (LOGIN-S3, FR-V02-04)
마이페이지(V13)는 본 라운드 본체 구현 대상이 아닙니다(설정 본체는 범위 밖). U1에서 어디까지?

A) **마이페이지 플레이스홀더에 "로그인하세요" 배너 + 게이트되는 항목 자리(프로필/내정보수정/계정관리, 비활성+탭시 시트)만 구현**, 실제 설정 기능은 후속 — **추천**
B) 배너만 구현(게이트 항목 자리 생략)
C) 마이페이지 손대지 않음(U3 탭바 연결 시 처리)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## C. 답변 후 진행
- 6개 `[Answer]:`가 모두 채워지면 "완료" 등으로 알려주세요.
- 모호함 분석 후 필요 시 추가 질문 → 없으면 산출물 생성.
