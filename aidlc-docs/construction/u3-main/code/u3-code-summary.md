# U3 Main — Code Generation Summary

> 검증: typecheck ✓ · 테스트 65/65 ✓ · build ✓(메인 gzip 102.5KB, MSW 동적 청크 분리) · lint ✓.

## 생성 파일
- Mock 백엔드: `src/shared/mocks/{data,handlers,browser}.ts` + `public/mockServiceWorker.js` + main.tsx(워커 시작)
- 브릿지: BridgeService.openCourseSearch/openCourseConfirm
- Repository: `src/features/main/api/{courseRepository,regionRepository}.ts`
- 공용: `src/shared/ui/AsyncBoundary.tsx`
- model: `src/features/main/model/{regionStore,useRegions,useRecommendedCourses}.ts`
- V02 UI: `src/features/main/ui/{MainView,RegionSelector,RecommendedCourseList,CourseCard,CoursePreviewPopup,CreateCourseButton}.tsx`
- 마이페이지/배너: `src/features/settings/ui/MyPageView.tsx` · `src/features/login/ui/LoginBanner.tsx`
- 탭바 게이트: `src/app/BottomTabBar.tsx`(수정) · 라우팅 `AppRouter.tsx`(/main, /mypage)
- 테스트: courseRepository · AsyncBoundary · BottomTabBar · CourseCard · MyPageView

## 스토리
- V02-S1(메인+코스) ✓ / V02-S2(탭바+게이트) ✓ / V02-S3(코스 만들기/확인) ✓ / V02-S4(지역) ✓ / V02-S5(미리보기) ✓
- LOGIN-S3(마이페이지 배너) ✓ (U1에서 재배정)

## 설계 반영
- TanStack Query + AsyncBoundary(로딩/에러/빈 상태) / MSW mock 백엔드 / 이미지 폴백 / history 팝업
- 탭바 게이트(기록 비로그인 차단) / 마이페이지 배너+게이트 항목
- Compliance: SECURITY-08/15, NFR-DATA-01/02 Compliant, PBT-10 example. 블로킹 없음.
