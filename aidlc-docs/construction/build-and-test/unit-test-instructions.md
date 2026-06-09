# Unit Test Instructions

> Vitest + @testing-library/react + jsdom + fast-check. example + property 병행(PBT-10).

## 실행
```bash
pnpm test          # 1회 실행
pnpm test:watch    # 워치 모드
FC_SEED=42 pnpm test   # PBT 시드 고정(실패 재현, PBT-08)
```

## 현재 상태
- **테스트 파일 17, 테스트 65개 전부 통과.**

## 커버리지 맵 (단위별)
| 단위 | 테스트 | 유형 |
|---|---|---|
| U0 | profileValidation/sessionLogic/gateRules/regionLogic | **property + example** (PBT-01) |
| U1 | apiClient(401/Bearer) · SessionService(무효화 1회 가드) · loginSheetStore · useGate · mockBridge(성공/취소/실패) · LoginBottomSheet | example |
| U2 | onboardingRepository(round-trip) · useOnboarding(하드/소프트/canSubmit/전이) | example |
| U3 | courseRepository/regionRepository · AsyncBoundary(로딩/에러/빈/데이터) · BottomTabBar(게이트) · CourseCard(openCourseConfirm/팝업) · MyPageView(배너/게이트) | example |

## PBT property (U0, fast-check numRuns 100)
- 키/체중 검증 동치 · isProfileComplete 동치/독립성 · 세션 전이 흡수/멱등 · 게이트 결정표 전수 · resolveDefaultRegion 전역 불변.

## 규칙
- 테스트는 소스 코로케이션(`*.test.ts(x)`).
- 공용 arbitraries: `src/shared/testing/arbitraries.ts`.
