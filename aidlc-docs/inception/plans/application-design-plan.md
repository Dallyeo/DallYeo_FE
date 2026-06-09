# Application Design Plan — Login · V01 · V02

> Application Design 단계 **Part 1 (Planning)** 산출물입니다.
> 아래 **질문**에 `[Answer]:` 태그로 답해 주세요. 모든 답이 채워지면 승인 후 **Part 2**에서
> `components.md` / `component-methods.md` / `services.md` / `component-dependency.md` / `application-design.md`를 생성합니다.

---

## A. 범위 / 접근

이 단계는 **고수준 컴포넌트 식별 + 서비스 계층 설계**입니다 (상세 비즈니스 로직은 Construction의 Functional Design에서).

- 입력: `requirements.md`(FR/NFR), `stories.md`(13 스토리), `personas.md`(3 페르소나)
- 이미 **CLAUDE.md에서 확정**되어 질문하지 않는 사항:
  - 아키텍처: Feature-Sliced Design(lite), Repository 패턴, 의존성 방향(presentation → application → domain ← data)
  - 폴더 구조: `app / features / domain / shared`
  - 브릿지: `window.DallYeoBridge` 단일 추상화 + request-id/promise registry + mock bridge
  - 데이터: 단일 typed API 클라이언트 + MSW, 세션 토큰=네이티브 단일 출처(메모리 보관)
  - 기술 스택: React + TypeScript + Vite + Tailwind, PBT=fast-check 후보
- 출력(필수 산출물):
  - [x] `components.md` — 컴포넌트 정의 + 책임
  - [x] `component-methods.md` — 메서드 시그니처 (비즈니스 룰은 Functional Design에서)
  - [x] `services.md` — 서비스/오케스트레이션 정의
  - [x] `component-dependency.md` — 의존 관계 + 통신 패턴 + 데이터 흐름
  - [x] `application-design.md` — 위 문서 통합본
  - [x] 설계 완전성/일관성 검증

---

## B. 질문 (모두 `[Answer]:`에 답해 주세요)

## Question 1 — 서버 상태 관리 (데이터 패칭)
백엔드 데이터(추천 코스, 지역 목록 등)의 패칭/캐싱/로딩·에러 상태를 어떻게 관리할까요?

A) **TanStack Query (React Query)** — 캐싱·로딩/에러·재시도·무효화 표준 제공, Repository 함수를 queryFn으로 래핑 — **추천**
B) 직접 만든 훅 (useEffect + useState 기반 fetch 래퍼)
C) SWR
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2 — 클라이언트 전역 상태 (세션 / 온보딩 / UI)
세션 인증 상태, 온보딩 완료 플래그, 로그인 바텀시트 같은 전역 클라이언트 상태는?

A) **Zustand** — 가볍고 보일러플레이트 적음, 단일 출처 인증 스토어 구성에 적합 — **추천**
B) React Context + useReducer (라이브러리 무도입)
C) Redux Toolkit
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3 — 라우팅
화면 전환/뒤로가기/바텀시트의 history 관리를 위한 라우팅은?

A) **React Router** — 표준, history 기반 모달/시트 관리 + iOS 좌측 스와이프 뒤로가기에 부합 — **추천**
B) 경량 라우터 (wouter 등)
C) 라우터 없이 자체 상태 기반 화면 전환
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4 — Repository 분할 단위
Repository 인터페이스를 어떻게 나눌까요? (UI/훅이 의존하는 데이터 계약)

A) **도메인별 분할** — AuthRepository / CourseRepository / RegionRepository / OnboardingRepository / (RunResultRepository 등 추후) — **추천**
B) 화면별 분할 (LoginRepo / OnboardingRepo / MainRepo)
C) 단일 통합 Repository (DallYeoRepository 하나)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5 — 브릿지 vs Repository 경계
네이티브 브릿지 호출(login, openCourseSearch, requestPermission 등)을 Repository 추상화 뒤에 둘지, 별도 BridgeService로 분리할지?

A) **혼합 (추천)** — 데이터 성격 호출(login→AppSession 등)은 Repository 뒤로, 화면 전환/디바이스 액션(openCourseSearch, requestPermission, share)은 별도 `BridgeService`로. UI는 둘 다 인터페이스로만 접근
B) 모든 브릿지 호출을 단일 `BridgeService`로 통합 (Repository는 백엔드 전용)
C) 모든 브릿지 호출도 Repository 인터페이스 안으로 흡수
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6 — 공통 로딩/에러/빈 상태 처리 패턴
스토리 AC에 반복 등장하는 로딩·에러·Empty 상태(예외처리)를 설계 차원에서 어떻게 표준화할까요?

A) **공용 UI 래퍼 컴포넌트** (`<AsyncBoundary>` 등 — 로딩/에러/빈 상태 + 재시도 슬롯 표준화) + TanStack Query 상태 연동 — **추천**
B) 각 화면이 개별적으로 분기 처리 (공용 컴포넌트 없음)
C) React Error Boundary + Suspense 중심
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## C. 답변 후 진행 (참고)
- 위 6개 `[Answer]:`가 모두 채워지면 알려주세요 ("완료" 등).
- 답변 분석 후 모호함이 있으면 추가 질문을 드립니다.
- 모호함이 없으면 승인 → Part 2에서 설계 산출물 5종 생성.
