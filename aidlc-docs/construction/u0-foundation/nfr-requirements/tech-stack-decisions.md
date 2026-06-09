# U0 Foundation — Tech Stack Decisions

> CONSTRUCTION / NFR Requirements 산출물 (단위: U0). 부트스트랩 단위이므로 전역 적용.

---

## 1. 사전 확정 (CLAUDE.md / requirements — 본 단계 재확인)
| 영역 | 선택 | 출처 |
|---|---|---|
| 프레임워크 | React + TypeScript | CLAUDE.md |
| 빌드 | Vite (SPA, no SSR) | CLAUDE.md |
| 스타일 | Tailwind CSS + CSS 변수(디자인 토큰) | NFR-UI-01 |
| 서버 상태 | TanStack Query | App Design Q1 |
| 전역 상태 | Zustand | App Design Q2 |
| 라우팅 | React Router | App Design Q3 |
| 백엔드 mock | MSW | NFR-DATA-01 |
| PBT 프레임워크 | **fast-check** | PBT-09, requirements |

## 2. 본 단계 결정 (U0 NFR Plan 답변)
| 영역 | 선택 | 근거 |
|---|---|---|
| 패키지 매니저 | **pnpm** (Q1=A) | 속도/디스크 효율/엄격 의존성 |
| 테스트 러너 | **Vitest** + **fast-check** + **@testing-library/react** + **jsdom** (Q2=A) | Vite 통합, PBT 자연 결합 |
| 린트/포맷 | **ESLint + Prettier** (typescript-eslint, eslint-plugin-react-hooks) (Q3=A) | 표준 |
| TS 엄격도 | **strict: true + noUncheckedIndexedAccess + noImplicitOverride + exactOptionalPropertyTypes** (Q4=A) | 도메인 계약 안전성 |
| PBT 실행 | **numRuns 100 + CI 시드 고정**(실패 재현) (Q5=A) | PBT-08 재현성 |
| 성능 목표 | **가벼운 가이드**(초기 JS gzip 목표 ≈ <300KB, 전환 즉각성), 엄격 측정 추후 (Q6=A) | 로컬 번들 SPA |

## 3. 버전 정책
- Node LTS 기준(개발 환경), 정확한 버전은 코드 생성 시 `package.json`/`.nvmrc`로 고정.
- 의존성 락: `pnpm-lock.yaml` 커밋(SECURITY-10 공급망 — 후속 NFR Design에서 스캐너 정책 보강).

## 4. U0가 생성할 설정 파일 (Code Generation 예고)
- `package.json`(pnpm) · `tsconfig.json`(엄격) · `vite.config.ts` · `vitest.config.ts`(jsdom, fast-check seed) · `tailwind.config.ts`(토큰) · `.eslintrc`/`.prettierrc` · `index.html`(viewport-fit=cover)
