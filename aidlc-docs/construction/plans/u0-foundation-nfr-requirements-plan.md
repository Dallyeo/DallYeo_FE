# U0 Foundation — NFR Requirements Plan

> CONSTRUCTION / NFR Requirements **Plan** (단위: U0 Foundation).
> 아래 **질문**에 `[Answer]:` 태그로 답해 주세요. 모두 채워지면 분석 후 산출물을 생성합니다.

---

## A. 범위

U0는 프로젝트 **부트스트랩 단위**이므로, 여기서 정하는 NFR/툴링 결정이 전 단위에 적용됩니다.

- **이미 확정**(CLAUDE.md/requirements — 질문 안 함): React 19 + TypeScript + Vite + Tailwind · TanStack Query · Zustand · React Router · MSW · **fast-check**(PBT-09) · Security Baseline + PBT 전체 강제 · Lo-Fi 토큰 · WebView NFR(100dvh/safe-area/overscroll) · 세션 메모리 보관.
- **이번에 결정할 것**: 패키지 매니저, 테스트 러너, 린트/포맷, TS 엄격도, PBT 실행 설정, 성능/번들 목표.
- 출력(필수 산출물):
  - [x] `nfr-requirements.md` — U0(및 전역) NFR 명세
  - [x] `tech-stack-decisions.md` — 툴링/버전/근거

---

## B. 질문 (모두 `[Answer]:`에 답해 주세요)

## Question 1 — 패키지 매니저
의존성 관리 도구는?

A) **pnpm** — 빠르고 디스크 효율적, 엄격한 의존성 — **추천**
B) npm (기본, 추가 설치 불필요)
C) yarn (berry/classic)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2 — 테스트 러너 / 도구
단위·PBT 테스트 실행 환경은?

A) **Vitest + fast-check + @testing-library/react + jsdom** — Vite 통합, PBT 후보(fast-check)와 자연스러움 — **추천**
B) Jest 기반
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3 — 린트 / 포맷
코드 품질 도구는?

A) **ESLint + Prettier** (typescript-eslint, react-hooks 규칙 포함) — 표준 — **추천**
B) Biome (lint+format 통합, 빠름)
C) 도입 안 함(이번 단계 보류)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4 — TypeScript 엄격도
tsconfig 엄격 수준은?

A) **strict: true + noUncheckedIndexedAccess 등 추가 엄격 옵션** — 도메인 계약 안전성↑ — **추천**
B) strict: true (기본 엄격만)
C) 느슨하게 시작 후 추후 강화
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5 — PBT 실행 설정 (PBT-08 재현성)
property 테스트 실행 횟수/시드 정책은?

A) **기본 실행수 100회 + CI에서 시드 고정(실패 재현 가능)** — **추천**
B) 실행수 늘림(예: 300+), 느려도 강한 보장
C) fast-check 기본값 그대로(설정 최소화)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6 — 성능 / 번들 목표 (로컬 번들 SPA)
앱 동봉 LOCAL 번들의 성능 목표는?

A) **가벼운 목표만 명시**(초기 JS gzip 목표 대략 < 300KB, 화면 전환 즉각성), 엄격 측정은 추후 — **추천**
B) 엄격한 성능 예산 + 측정 도구(Lighthouse CI 등) 지금 도입
C) 이번 단계 성능 목표 미설정
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## C. 답변 후 진행
- 6개 `[Answer]:`가 모두 채워지면 "완료" 등으로 알려주세요.
- 모호함 분석 후 필요 시 추가 질문 → 없으면 산출물 생성.
