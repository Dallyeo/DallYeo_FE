# U1 Login — Tech Stack Decisions (증분)

> CONSTRUCTION / NFR Requirements 산출물 (단위: U1). U0 결정을 상속.

## 1. 증분
- **새 런타임/개발 의존성 없음.** U0에서 확정된 스택(React/TS/Vite/Tailwind · TanStack Query · Zustand · React Router · MSW · fast-check · Vitest · ESLint/Prettier · pnpm)만 사용.
- U1이 활용하는 기존 스택:
  - **Zustand**: sessionStore, loginSheetStore
  - **fetch 래퍼(apiClient)**: U1에서 최초 실구현(라이브러리 추가 없음, 표준 fetch)
  - **브릿지**: 라이브러리 없음(자체 request-id/promise registry)

## 2. 결정
| 영역 | 선택 | 근거 |
|---|---|---|
| 토큰 보관 | apiClient 모듈 스코프 클로저(setToken/clearToken/getAuthHeader만 노출) | Q1=A, SECURITY-12 |
| 관측성 | 개발 콘솔 로깅 + 원격 수집 훅 placeholder(토큰/민감정보 미로깅) | Q2=A |
| U1 테스트 | example 기반(컴포넌트=Testing Library, 로직=unit). property 신규 없음 | Q3=B |

→ tech-stack 변경 없음. 빌드/툴링 영향 없음.
