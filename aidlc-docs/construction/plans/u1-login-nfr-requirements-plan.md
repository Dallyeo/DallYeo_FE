# U1 Login — NFR Requirements Plan

> CONSTRUCTION / NFR Requirements **Plan** (단위: U1 Login).
> 전역 NFR/툴링(pnpm·Vitest·fast-check·TS strict·번들 목표 등)은 U0에서 확정 — 여기선 **U1 고유 인증 NFR**만 질문.

---

## A. 범위
- 상속(U0): 성능 목표, WebView 호환, 테스트 도구, 보안 베이스라인, PBT 설정.
- U1 고유 결정: 토큰 메모리 위치, 로그인/세션 관측성, U1 PBT 대상.
- 출력: `nfr-requirements.md`, `tech-stack-decisions.md`(U1 증분 — 새 라이브러리 없으면 "증분 없음" 명시).

---

## B. 질문 (모두 `[Answer]:`에 답해 주세요)

## Question 1 — 토큰 메모리 보관 위치 (SECURITY-12)
Bearer 토큰을 메모리 어디에 둘까요?

A) **apiClient 내부 모듈 스코프 변수(클로저)** — 컴포넌트/스토어에서 직접 읽을 수 없게 캡슐화, setToken/clear만 노출 — **추천**
B) Zustand sessionStore에 token 필드로 보관(persist 미사용)
C) 별도 in-memory tokenStore 모듈
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2 — 로그인/세션 이벤트 관측성 (SECURITY-03 deferred 범위)
로그인 성공/실패·세션 만료를 클라이언트에서 기록할까요?

A) **개발 콘솔 로깅만(민감정보·토큰 절대 미로깅), 원격 수집 훅 자리만 마련** — MVP 단순 + 확장 여지 — **추천**
B) 지금 원격 로깅/애널리틱스 연동
C) 로깅 없음
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3 — U1 PBT 대상 범위 (PBT-01)
U1에서 property 기반 테스트로 다룰 대상은?

A) **loginSheet 상태전이(open/close/pendingAction 규칙) + invalidate 멱등(중복 신호 1회 효과)** 두 가지를 property로, 나머지(컴포넌트·브릿지)는 example/통합 테스트 — **추천**
B) 도메인 순수 로직만(U0에서 이미 커버) — U1은 example만
C) 더 광범위(BridgeService mock 동작까지 property)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## C. 답변 후 진행
- 3개 `[Answer]:`가 모두 채워지면 "완료" 등으로 알려주세요.
- 모호함 분석 후 필요 시 추가 질문 → 없으면 산출물 생성.
