# U3 Main — Code Generation Plan (자동승인)

> 단위: U3. 코드=워크스페이스 루트 src/. 스토리: V02-S1~S5 + LOGIN-S3.

## 단계
### Step 1 — 의존성/Mock 인프라
- [x] msw 추가 + `public/mockServiceWorker.js` 생성
- [x] `src/shared/mocks/{data.ts,handlers.ts,browser.ts}` (courses/regions mock)
- [x] main.tsx: env.enableMsw 시 워커 시작 후 렌더
### Step 2 — 브릿지 확장
- [x] BridgeService: openCourseSearch/openCourseConfirm 추가
### Step 3 — Repository
- [x] `src/features/main/api/{courseRepository.ts,regionRepository.ts}`
### Step 4 — AsyncBoundary
- [x] `src/shared/ui/AsyncBoundary.tsx`
### Step 5 — model
- [x] `src/features/main/model/{regionStore.ts,useRegions.ts,useRecommendedCourses.ts}`
### Step 6 — UI (V02)
- [x] `src/features/main/ui/{CourseCard,CoursePreviewPopup,RecommendedCourseList,RegionSelector,CreateCourseButton,MainView}.tsx`
### Step 7 — 마이페이지 + 배너 (LOGIN-S3)
- [x] `src/features/login/ui/LoginBanner.tsx`
- [x] `src/features/settings/ui/MyPageView.tsx` (배너 + 게이트 항목)
### Step 8 — 탭바 게이트 + 라우팅
- [x] BottomTabBar: 기록 탭 useGate.guard 연결
- [x] AppRouter: /main→MainView, /mypage→MyPageView
### Step 9 — 테스트
- [x] courseRepository/regionRepository, AsyncBoundary, BottomTabBar 게이트, CourseCard, MyPage 배너
### Step 10 — 문서요약
- [x] u3-code-summary.md
