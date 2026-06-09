# U0 Foundation — Functional Design Plan

> CONSTRUCTION / Functional Design **Plan** (단위: U0 Foundation).
> 아래 **질문**에 `[Answer]:` 태그로 답해 주세요. 모두 채워지면 분석 후 산출물을 생성합니다.

---

## A. 범위

U0 Foundation은 **골격 단위**(Q3=B)로, UI 스토리는 없지만 전 단위가 의존하는 **도메인 모델 + 순수 비즈니스 로직 + 앱 셸/토큰**을 정의합니다. 기술 비종속(인프라 관심사 제외).

- 입력: `unit-of-work.md`(U0 정의), `requirements.md`(FR-V01 검증 규칙 등), `application-design.md`(domain 타입/로직)
- 핵심 설계 대상(순수 로직 — **PBT 1차 대상**):
  - `profileValidation` (키/체중 검증, 입력완료 판정) — FR-V01-05/06/09
  - `sessionLogic` (AuthStatus 상태 전이) — LOGIN-S4
  - `gateRules` (인증상태×액션 → 허용/차단) — FR-V02-03/04
  - `regionLogic` (기본 지역 해석) — FR-V02-08
- 출력(필수 산출물):
  - [x] `domain-entities.md` — 도메인 엔티티/타입 + 관계
  - [x] `business-rules.md` — 검증/결정 규칙 + 예외
  - [x] `business-logic-model.md` — 로직 흐름/상태 모델 + PBT property 후보
  - (frontend-components.md는 U0에 UI 스토리 없음 → 셸 수준만 business-logic-model에 간략 포함)

---

## B. 질문 (모두 `[Answer]:`에 답해 주세요)

## Question 1 — 키/체중 검증의 의미적 범위
FR은 **자릿수**만 규정합니다(키: 정수·최대 3자리 / 체중: 정수·2~3자리). 의미적(현실적) 범위 검증도 넣을까요?

A) **자릿수 규칙만** (FR 그대로: 키 1~3자리, 체중 2~3자리 정수) — 가장 단순, 스펙 충실 — **추천**
B) 자릿수 + 합리적 범위 가드 (예: 키 50~250cm, 체중 20~300kg 권장 경고) — 입력 실수 추가 방지
C) 자릿수 + 엄격 범위(범위 밖이면 입력 차단)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2 — 키 최소 자릿수
FR은 "키 ≤ 3자리"만 명시(하한 없음). 1자리(예: 9), 2자리도 허용할까요?

A) **1~3자리 모두 허용** (FR 문구 그대로, 하한 미설정) — **추천**
B) 키도 체중처럼 2~3자리로 제한
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3 — 성별 "선택안함"과 입력완료 판정
성별 4옵션 중 "선택안함"을 골랐을 때 FR-V01-09의 "성별이 채워짐"으로 볼까요?

A) **'선택안함'도 명시적 선택 → 채워진 것으로 간주** (3항목 충족, 입력완료 활성) — **추천**
B) '선택안함'은 미선택과 동일 취급 → 입력완료 비활성
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4 — AuthStatus 초기값 & 부트스트랩
앱 시작 시 세션 확인 전 초기 상태 처리는?

A) **'unknown'에서 시작 → 부트스트랩 후 authenticated/unauthenticated 확정**. unknown 동안 게이트는 차단 측(비로그인처럼) 처리 — **추천**
B) 'unauthenticated'로 시작(낙관적 비로그인), 세션 확인되면 승격
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5 — 기본 지역 해석 규칙
`resolveDefaultRegion(regions)`에서 군산이 목록에 없을 때 동작은?

A) **군산 우선 → 없으면 목록 첫 항목 → 목록도 비면 안전한 기본 placeholder** — **추천**
B) 군산 없으면 에러(목록에 군산 보장 가정)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6 — gateRules 마이페이지 처리 방식
마이페이지는 "탭 진입은 허용, 내부 항목(프로필/내정보수정/계정관리)만 게이트"입니다. 규칙을 어떻게 모델링할까요?

A) **액션 단위 규칙** — 'myPageTab'=항상 허용, 'myPageProfile'/'myPageEditInfo'/'myPageAccount'/'recordsTab'/'saveRunResult'=비로그인 차단 — **추천**
B) 탭 단위만 규칙화하고 내부 항목 게이트는 UI에서 개별 처리
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## C. 답변 후 진행
- 6개 `[Answer]:`가 모두 채워지면 "완료" 등으로 알려주세요.
- 모호함 분석 후 필요 시 추가 질문 → 없으면 산출물 생성.
