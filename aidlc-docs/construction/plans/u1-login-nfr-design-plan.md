# U1 Login — NFR Design Plan

> CONSTRUCTION / NFR Design **Plan** (단위: U1 Login).
> U0 패턴(P-1 에러경계 · P-2 회복력 · P-3 env토글 · P-4 보안 · P-6 테스트)을 상속 적용.
> 인프라성 패턴(큐/캐시/서킷브레이커)은 N/A(클라이언트 SPA). U1 인증 고유 패턴만 질문.

---

## A. 범위
- 상속: U0 NFR Design 패턴 전부.
- U1 적용 대상: 토큰 캡슐화, 세션 단일 출처, 브릿지 registry/timeout, 401 인터셉트, 로그인 에러.
- 출력: `nfr-design-patterns.md`, `logical-components.md`.

---

## B. 질문 (모두 `[Answer]:`에 답해 주세요)

## Question 1 — 401 인터셉트 구현 방식 (BR-U1-4, P-2)
apiClient가 401을 어떻게 감지/전파할까요?

A) **apiClient가 모든 응답 상태 검사 → 401이면 등록된 onUnauthorized 콜백 호출 후 표준 에러 throw** — 호출부는 에러로, 세션 무효화는 콜백으로 분리 — **추천**
B) 401도 일반 에러로만 throw, 세션 무효화 판단은 각 호출부
C) axios 등 인터셉터 라이브러리 도입
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2 — 브릿지 이벤트 구독 수명주기 (NFR-AUTH-03)
`sessionChanged` 등 네이티브 이벤트 구독을 어디서 등록/해제할까요?

A) **SessionService가 앱 부트스트랩(AppRoot effect)에서 1회 구독, 언마운트 시 해제** — 단일 구독자 보장 — **추천**
B) 각 화면이 필요 시 개별 구독
C) 모듈 로드 시점 전역 구독(해제 없음)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3 — 로그인 진행 중 동시성 (중복 탭 방지)
로그인 버튼 연타/동시 호출을 어떻게 막을까요?

A) **pending 중 버튼 비활성 + in-flight 로그인 promise 단일화(중복 호출 무시)** — **추천**
B) UI 비활성만(로직 단일화 없음)
C) 별도 처리 안 함
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## C. 답변 후 진행
- 3개 `[Answer]:`가 모두 채워지면 "완료" 등으로 알려주세요.
- 모호함 분석 후 필요 시 추가 질문 → 없으면 산출물 생성.
