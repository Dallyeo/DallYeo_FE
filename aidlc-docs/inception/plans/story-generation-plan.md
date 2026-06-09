# Story Generation Plan — Login · V01 · V02

> User Stories 단계 **Part 1 (Planning)** 산출물입니다.
> 아래 **질문**에 `[Answer]:` 태그로 답해 주세요. 모든 질문에 답이 채워지면, 이 플랜을 승인받은 뒤
> **Part 2 (Generation)**에서 `stories.md` / `personas.md`를 생성합니다.
> (질문 외 체크박스는 Part 2에서 단계 완료 시 `[x]`로 마킹됩니다.)

---

## A. 방법론 / 접근 (Product Owner 관점)

이 플랜은 `requirements.md`의 FR/NFR을 **사용자 중심 스토리 + 페르소나**로 변환합니다.
- 입력: `aidlc-docs/inception/requirements/requirements.md` (FR-LOGIN / FR-V01 / FR-V02, NFR-*)
- 출력(필수 산출물):
  - [x] `aidlc-docs/inception/user-stories/stories.md` — INVEST 기준 사용자 스토리 + 수용기준
  - [x] `aidlc-docs/inception/user-stories/personas.md` — 사용자 아키타입 + 특성
  - [x] 각 스토리에 수용기준(Acceptance Criteria) 포함
  - [x] 페르소나 ↔ 스토리 매핑
  - [x] INVEST(Independent·Negotiable·Valuable·Estimable·Small·Testable) 검증

---

## B. 스토리 분해 방식 옵션 (트레이드오프)

| 방식 | 설명 | 이 프로젝트 적합성 |
|---|---|---|
| User Journey-Based | 사용자 흐름(최초 실행→온보딩→메인→게이트 시도→로그인)을 따라 스토리 구성 | 온보딩/로그인 흐름 가시화에 강함 |
| Feature-Based | 화면/기능(Login, V01, V02) 단위로 묶음 | requirements FR 구조와 1:1, 추적 쉬움 |
| Persona-Based | 비로그인/로그인 등 사용자 유형별 묶음 | 게이트 분기 강조에 강함 |
| Hybrid (Feature + Persona) | 기능으로 큰 묶음(Epic) + 페르소나로 분기 스토리 | **추천** — FR 추적 + 게이트 분기 모두 포착 |

---

## C. 질문 (모두 `[Answer]:`에 답해 주세요)

## Question 1 — 스토리 분해 방식
어떤 방식으로 스토리를 묶을까요?

A) Hybrid (Feature 단위 Epic + Persona 분기 스토리) — **추천**
B) Feature-Based (Login / V01 / V02 기능 단위)
C) User Journey-Based (사용자 흐름 순서)
D) Persona-Based (비로그인 / 로그인 유형 단위)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2 — 페르소나 구성
정의할 사용자 페르소나 세트는?

A) 2종: 비로그인 방문자 / 로그인 사용자
B) 3종: 비로그인 방문자 / 로그인 사용자 / 최초 실행(온보딩) 사용자 — **추천**
C) 4종: 위 3종 + 권한 거부 사용자(위치 권한 거부 상태를 별도 페르소나로)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3 — 수용기준(Acceptance Criteria) 형식
각 스토리의 수용기준을 어떤 형식으로 쓸까요?

A) Given-When-Then (Gherkin 스타일, 한국어 서술) — 테스트/PBT 매핑에 유리, **추천**
B) 체크리스트형 불릿 (조건 나열)
C) 혼합 (핵심 분기는 Given-When-Then, 단순 항목은 불릿)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4 — 스토리 세분화(Granularity)
스토리 크기/계층을 어느 수준으로?

A) Epic → Story 2계층 (화면=Epic, 기능 단위=Story) — **추천**
B) 플랫(계층 없이 스토리 나열)
C) Epic → Story → Sub-task 3계층 (더 상세)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5 — 예외처리(빈/에러/권한 거부 상태) 표현
requirements의 예외처리(위치 권한 거부, 네트워크 오류, 빈 추천 코스 목록, 세션 만료 등)를 어떻게 담을까요?

A) 각 스토리의 수용기준(AC) 안에 정상/예외 시나리오를 함께 기술 — **추천**
B) 예외처리를 별도의 독립 스토리로 분리
C) 혼합 (영향 큰 예외만 별도 스토리, 나머지는 AC에 포함)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6 — 추적성/태그 포함 여부
스토리에 추적용 메타데이터를 붙일까요? (FR-ID 역참조, 보안/PBT 관련 표시)

A) FR-ID 역참조 + 보안(SECURITY-*)/PBT 후보 태그 모두 포함 — **추천** (후속 Design·Code 단계 연결에 유리)
B) FR-ID 역참조만 포함
C) 태그 없이 순수 스토리 + 수용기준만
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## D. 답변 후 진행 (참고)
- 위 6개 `[Answer]:`가 모두 채워지면 알려주세요 ("완료" 등).
- 답변 분석 후 모호함이 있으면 별도 clarification 파일로 추가 질문을 드립니다.
- 모호함이 없으면 이 플랜 승인 → Part 2에서 `stories.md` / `personas.md` 생성.
