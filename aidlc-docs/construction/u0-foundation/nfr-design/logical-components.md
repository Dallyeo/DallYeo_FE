# U0 Foundation — Logical Components (NFR)

> CONSTRUCTION / NFR Design 산출물 (단위: U0). NFR을 실현하는 논리 컴포넌트.
> 인프라성 컴포넌트(큐/캐시/서킷브레이커)는 N/A. 프론트 횡단 컴포넌트 중심.

---

## 1. 논리 컴포넌트 목록

| 컴포넌트 | 위치(예정) | 책임 | 대응 패턴 |
|---|---|---|---|
| `GlobalErrorBoundary` | `app/` | 앱 루트 최후방 에러 폴백 | P-1 |
| `RouteErrorBoundary` | `app/` | 라우트별 에러 격리 | P-1 |
| `AsyncBoundary` | `shared/ui/` (U3 구현) | 로딩/에러/빈 상태 + 재시도 | P-1, P-2 |
| `queryClient` | `shared/api/` | TanStack Query 기본 정책(retry 1, 백오프, staleTime) | P-2 |
| `apiClient` | `shared/api/` | Bearer 주입 + 401 인터셉트 + base URL(env) | P-2, P-3, P-4 |
| `bridgeAdapter` (timeout 래퍼) | `shared/bridge/` | request-id 레지스트리 + 10s 타임아웃 + 미응답 정리 | P-2 |
| `bridgeResolver` | `shared/bridge/` | 실 어댑터 vs mockBridge 자동 감지/주입 | P-3 |
| `env config` | `shared/config/` | VITE_* 플래그 파싱(단일 출처) | P-3 |
| `securityMeta` | `index.html` | CSP/메타 보안 헤더 | P-4 |
| `designTokens` | `shared/styles/` | CSS 변수 + Tailwind theme | P-5, NFR-UI |
| `arbitraries` | `shared/testing/` | 공용 fast-check 생성기 | P-6 |

> 이 중 U0에서 **즉시 구현**: GlobalErrorBoundary, RouteErrorBoundary, env config, securityMeta, designTokens, arbitraries, queryClient/apiClient/bridge의 기반(점진 — Q3=B에 따라 apiClient/bridge 실사용은 U1에서 확장). AsyncBoundary는 U3.

---

## 2. 컴포넌트 상호작용 (NFR 관점)

```
AppRoot
  ├─ GlobalErrorBoundary (감쌈)
  ├─ env config -> bridgeResolver -> bridgeAdapter | mockBridge
  ├─ env config -> apiClient(baseURL) ; queryClient(retry policy)
  └─ AppRouter
       └─ RouteErrorBoundary (라우트별)
            └─ (화면) ── 데이터 ──> AsyncBoundary (U3~)
401 ──> apiClient.onUnauthorized ──> (U1 SessionService) 무효화
브릿지 미응답 ──(10s)──> bridgeAdapter timeout reject
```

---

## 3. 회복력/장애 시나리오 매핑

| 시나리오 | 처리 컴포넌트 | 결과 |
|---|---|---|
| 화면 렌더 예외 | RouteErrorBoundary | 해당 화면만 폴백, 탭바 유지 |
| 치명적 루트 예외 | GlobalErrorBoundary | 전체 폴백 + 재시도 |
| API 일시 실패 | queryClient(retry 1) → AsyncBoundary | 1회 재시도 후 에러 상태+재시도 버튼 |
| 브릿지 무응답 | bridgeAdapter(10s) | reject → 사용자 재시도 안내 |
| 세션 401 | apiClient → (U1) | 세션 무효화 1회 |
| 백엔드 미준비 | env config + MSW | mock 응답으로 화면 미리보기 |

---

## 4. 검증
- [x] 모든 NFR 패턴(P-1~P-6)에 논리 컴포넌트 대응
- [x] 인프라성 컴포넌트 N/A 정당화(클라이언트 SPA)
- [x] U0 즉시 구현 vs 점진(U1~) 도입 경계 명시(Q3=B 일관)
- [x] Mermaid 미사용(텍스트 다이어그램만 — 파싱 안전)
