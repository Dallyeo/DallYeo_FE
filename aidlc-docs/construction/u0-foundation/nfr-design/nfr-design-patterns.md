# U0 Foundation — NFR Design Patterns

> CONSTRUCTION / NFR Design 산출물 (단위: U0). NFR Requirements를 설계 패턴으로 구체화.
> 답변: Q1=A(3단 에러경계) · Q2=A(회복력) · Q3=A(env 토글) · Q4=A(기본 CSP) · Q5=A(코로케이션 테스트).

---

## P-1. 에러 경계 패턴 (Q1=A) — NFR-U0-REL, SECURITY-15
3단 방어:
1. **전역 Error Boundary** (`AppRoot`): 최후방. 예기치 못한 렌더 에러 시 전체 폴백 UI("문제가 발생했어요" + 새로고침) — 앱 백지화 방지.
2. **라우트별 Error Boundary** (`AppRouter`): 화면 단위 격리. 한 화면 에러가 탭바/다른 화면을 깨지 않음.
3. **AsyncBoundary** (U3 도입): 데이터 로딩/에러/빈 상태 표준화(TanStack Query 연동) — 비동기 데이터 에러는 throw 대신 상태로.
> 동기 렌더 에러=Error Boundary, 비동기 데이터 에러=AsyncBoundary로 역할 분리.

## P-2. 비동기 회복력 패턴 (Q2=A) — NFR-U0-PERF/REL
| 채널 | 정책 |
|---|---|
| API 쿼리(TanStack Query) | retry **1회** + 지수 백오프, `staleTime` 합리적 기본, 에러는 AsyncBoundary 노출 |
| API 변이(mutation) | retry **0** (중복 부작용 방지), 실패 시 사용자 재시도 |
| 브릿지 호출 | **타임아웃(10s) 후 reject**, 자동 재시도 없음. promise registry에서 미응답 request-id 정리(누수 방지) |
| 세션 무효화 | 401/sessionChanged 합류 시 **1회 가드**(BR-2.2) |
> queryClient 기본 옵션 + bridgeAdapter 타임아웃 래퍼로 중앙화.

## P-3. 환경/데이터소스 토글 패턴 (Q3=A) — NFR-DATA-01
- `VITE_*` 환경변수: `VITE_API_BASE_URL`, `VITE_ENABLE_MSW`, `VITE_FORCE_MOCK_BRIDGE`.
- **브릿지 자동 감지**: `window.DallYeoBridge` 존재 → 실 어댑터, 없으면(브라우저) mock 브릿지. (NFR-BRIDGE-03)
- **MSW 토글**: 개발/미준비 엔드포인트는 MSW on. 준비된 엔드포인트는 passthrough(엔드포인트별 핸들러 제거로 실연동).
- 단일 부트스트랩 지점에서 어댑터/모킹 주입 1회.

## P-4. 보안 패턴 (Q4=A) — SECURITY-04/12/13
- **CSP/메타**: `index.html`에 기본 CSP(default-src 'self', img-src 'self' https: data:, connect-src API base) + `viewport-fit=cover`. 강한 정책은 네이티브 WebView 설정과 후속 협의.
- **외부 리소스 최소화**: 정적 경로 미리보기 이미지 등 외부 URL은 https 화이트리스트 가이드.
- **토큰**: apiClient 메모리 보관, Authorization Bearer 자동 주입, 저장소 미사용(SECURITY-12).
- **401 인터셉트**: 단일 지점에서 세션 무효화 신호(SECURITY-11 분리).

## P-5. 성능 패턴 — NFR-U0-PERF
- 라우트 기준 코드 스플리팅 여지(React.lazy) 확보. U0 셸은 경량 유지.
- 디자인 토큰=CSS 변수 → 런타임 테마 스왑 비용 최소.

## P-6. 테스트 패턴 (Q5=A) — PBT-01/08/10
- **코로케이션**: `*.test.ts(x)`를 대상 옆에.
- domain 로직 4종: **property(fast-check) + example** 병행, 공용 `arbitraries` 모듈(유효/무효 키·체중 문자열, AuthStatus, Region[] 생성기).
- fast-check **numRuns 100 + CI 시드 고정**(PBT-08).

---

## 패턴 ↔ NFR/규칙 추적
| 패턴 | 대응 |
|---|---|
| P-1 | NFR-U0-REL-01, SECURITY-15 |
| P-2 | NFR-U0-PERF, NFR-U0-REL, FR-LOGIN-06 |
| P-3 | NFR-DATA-01, NFR-BRIDGE-03 |
| P-4 | SECURITY-04/12/13, NFR-WEBVIEW-01 |
| P-6 | PBT-01/08/10 |

## N/A (정당화)
서버/인프라 패턴(메시지 큐·분산 캐시·서킷 브레이커·오토스케일·로드밸런서)은 로컬 번들 SPA에 해당 없음 → Infrastructure Design SKIP과 일관.
