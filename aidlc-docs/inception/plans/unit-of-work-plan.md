# Unit of Work Plan — Login · V01 · V02

> Units Generation 단계 **Part 1 (Planning)** 산출물입니다.
> 아래 **질문**에 `[Answer]:` 태그로 답해 주세요. 모든 답이 채워지면 승인 후 **Part 2**에서
> `unit-of-work.md` / `unit-of-work-dependency.md` / `unit-of-work-story-map.md`를 생성합니다.

---

## A. 범위 / 접근

이 단계는 시스템을 **개발 단위(Unit of Work)**로 분해합니다 (스토리 그룹 → 단위, 단위별로 Construction 반복).

- 입력: `requirements.md`, `stories.md`(13), `application-design.md`(컴포넌트/서비스/의존)
- **CLAUDE.md에서 확정**되어 질문하지 않는 사항:
  - 배포 모델: **단일 SPA, LOCAL 번들**(앱 동봉) — 독립 배포 단위는 1개(전체 앱). 따라서 단위는 "마이크로서비스"가 아니라 **모놀리식 내부 논리 모듈**.
  - 폴더 구조: `app / features / domain / shared` (FSD-lite)
  - 구축 우선순위: Login & V01 & V02 → (이후 V10 등). 본 라운드는 이 3개 화면 + 공통 기반.
- 출력(필수 산출물):
  - [x] `unit-of-work.md` — 단위 정의 + 책임 + (그린필드) 코드 조직 전략
  - [x] `unit-of-work-dependency.md` — 단위 간 의존 매트릭스
  - [x] `unit-of-work-story-map.md` — 스토리 ↔ 단위 매핑 (13개 전부 배정)
  - [x] 단위 경계/의존 검증, 모든 스토리 배정 확인

---

## B. 권고 분해 (Application Design §6 기반)

| 단위 | 내용 | 스토리 |
|---|---|---|
| U0 Foundation | domain 타입/로직, apiClient+MSW, bridgeAdapter+mockBridge+BridgeService, sessionStore+SessionService, AppShell/Router/TabBar, 디자인토큰, AsyncBoundary/uiKit | (인프라 — 직접 스토리 없음, 전 스토리의 토대) |
| U1 Login | LoginBottomSheet/Banner, useAuth/useGate, AuthRepository, GateService | LOGIN-S1~S4 |
| U2 Onboarding (V01) | OnboardingFlow + Step들, useOnboarding, OnboardingRepository | V01-S1~S4 |
| U3 Main (V02) | MainView/CourseCard/Popup/RegionSelector, useRecommendedCourses/useRegions, Course/Region Repository | V02-S1~S5 |

---

## C. 질문 (모두 `[Answer]:`에 답해 주세요)

## Question 1 — 단위 분해 구성
위 4단위 분해(U0 Foundation + U1 Login + U2 V01 + U3 V02)로 진행할까요?

A) **4단위 (Foundation + 화면 3개)** — 공통 기반을 별도 단위로 먼저 구축 — **추천**
B) 3단위 (Foundation 없이, 공통 코드는 첫 단위 U1에 흡수)
C) 2단위 (Foundation + 화면 전체를 한 단위로)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2 — 구축 순서(시퀀싱)
단위를 어떤 순서로 Construction 진행할까요?

A) **U0 Foundation → U1 Login → U2 V01 → U3 V02** (의존 순서 + CLAUDE.md 우선순위) — **추천**
B) U0 Foundation → U2 V01 → U1 Login → U3 V02 (최초 사용자 흐름 순서: 온보딩 먼저)
C) 순서 무관 (병렬 가정)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3 — Foundation 단위의 산출 깊이
U0 Foundation을 첫 단위로 구축할 때 어디까지 포함할까요?

A) **공통 인프라 전체** (타입+API클라+MSW+브릿지+세션+셸/탭바+토큰+AsyncBoundary) 한 번에 — **추천**
B) 최소 골격만 (타입+셸+토큰), 나머지는 각 화면 단위에서 필요 시 추가
C) 타입/도메인 로직만 별도, 인프라는 화면 단위에 분산
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4 — 단위 간 통합/공유 방식
단위들이 공통 기반(U0)을 공유하는 방식은?

A) **U0를 공유 의존**: U1~U3는 U0의 shared/domain을 import. 단위 간 직접 의존 없음(모두 U0 경유) — **추천**
B) 각 단위가 필요한 공통 코드를 자체 복제 후 추후 통합
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5 — MVP3 보류 항목의 데이터 모델 선반영
CLAUDE.md상 "지금 데이터 모델만 정의, UI는 보류"인 항목(V11 기간통계, V14 업적)을 이번 단위 분해에서 어떻게 다룰까요?

A) **본 라운드 단위에서 제외** — Login/V01/V02에 무관하므로 지금 단위로 만들지 않음(추후 라운드에서) — **추천**
B) U0 Foundation에 placeholder 타입만 포함(RunResult처럼 예약)
C) 별도 placeholder 단위 신설
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## D. 답변 후 진행 (참고)
- 위 5개 `[Answer]:`가 모두 채워지면 알려주세요 ("완료" 등).
- 답변 분석 후 모호함이 있으면 추가 질문을 드립니다.
- 모호함이 없으면 승인 → Part 2에서 단위 산출물 3종 생성.
