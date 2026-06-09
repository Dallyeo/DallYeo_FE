# Build and Test Summary — 달여(DallYeo) Frontend (MVP1: Login·V01·V02)

## 검증 결과 (전 단위 통합, 2026-06-09)
| 항목 | 명령 | 결과 |
|---|---|---|
| 타입체크 | `pnpm typecheck` | ✅ 통과 (TS strict + 추가 엄격) |
| 린트 | `pnpm lint` | ✅ 통과 (max-warnings 0) |
| 단위 테스트 | `pnpm test` | ✅ **17 파일 / 65 테스트 전부 통과** |
| 빌드 | `pnpm build` | ✅ 성공 (메인 gzip 102.5KB < 300KB) |

## 구현 범위 (단위)
- **U0 Foundation**: 도메인 타입/순수로직 4종(PBT) · 앱 셸/라우터/탭바 · 디자인 토큰 · 에러경계 · env
- **U1 Login**: 브릿지(adapter/mock/Service) · apiClient(토큰 클로저/401) · sessionStore/SessionService · 로그인 바텀시트 · 게이트 · 세션 만료(LOGIN-S1/S2/S4)
- **U2 Onboarding(V01)**: 1회 표시 · 위치 권한 · 신체정보 입력/검증 · 건너뛰기(V01-S1~S4)
- **U3 Main(V02)**: 추천 코스(MSW+TanStack Query+AsyncBoundary) · 지역 선택 · 네이티브 코스 진입 · i-버튼 미리보기 · 탭바 게이트 · 마이페이지 배너(V02-S1~S5 + LOGIN-S3)

## 스토리 커버리지
- 13개 사용자 스토리 전부 구현(LOGIN-S1~S4 · V01-S1~S4 · V02-S1~S5).
- LOGIN-S3는 U1→U3 재배정(FD Q6=C).

## Extension Compliance (전 단계 종합)
- **Security Baseline**: 입력검증(05)·접근제어(08)·보안핵심분리(11)·자격증명(12, 토큰 클로저/비저장)·예외처리(15)·기본 CSP(04) 적용. 공급망(10) lock 커밋. 블로킹 없음.
- **PBT**: U0 도메인 로직 property + example(PBT-01/10), numRuns 100 + FC_SEED(PBT-08), fast-check(PBT-09). U1~U3는 example 중심(Q3=B).

## 미구현/후속 (의도된 범위 밖)
- 실제 백엔드 엔드포인트 연동(현재 MSW mock) · 실 OAuth(네이티브) · 실 디자인(Lo-Fi 토큰만)
- V10 완주결과 · V11/V12 기록 · V13 설정 본체 · V14 업적 (후속 라운드)
- E2E 자동화(Playmaker 등) · Lighthouse 성능 예산

## 다음 단계
- Operations 단계(현재 placeholder). 실제 배포/모니터링은 향후 확장.
