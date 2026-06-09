# U3 Main — Tech Stack Decisions

> 단위: U3. **증분: msw 추가.**
- `msw`(devDependency) 설치 — 전역 결정(NFR-DATA-01)의 실설치 지점. `public/mockServiceWorker.js` 생성.
- 그 외 신규 의존성 없음(TanStack Query는 U0 설치분 사용).
- AsyncBoundary는 자체 컴포넌트(라이브러리 아님).
