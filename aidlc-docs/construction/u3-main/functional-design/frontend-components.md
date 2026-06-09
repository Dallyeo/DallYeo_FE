# U3 Main — Frontend Components

> 단위: U3. V02 메인뷰 + 마이페이지 배너/게이트.

## 계층
```
MainView (/main, 탭바 O)
  ├─ RegionSelector       (기본 군산)
  ├─ AsyncBoundary
  │    └─ RecommendedCourseList
  │         └─ CourseCard[]   (본문 탭→openCourseConfirm / i-버튼→팝업)
  ├─ CreateCourseButton   (→openCourseSearch)
  └─ CoursePreviewPopup    (i-버튼, history 엔트리)

MyPageView (/mypage, 탭바 O)
  ├─ LoginBanner          (비로그인 시, LOGIN-S3)
  └─ GatedSettingItem[]   (프로필/내정보수정/계정관리, 비로그인 비활성+시트)

BottomTabBar (U0 → U3에서 게이트 연결)
```

## 명세 (주요 data-testid)
- `main-view`, `region-selector`, `recommended-course-list`, `course-card-{id}`,
  `course-card-info-{id}`(i-버튼), `create-course-button`, `course-preview-popup`,
  `course-preview-image`, `mypage-view`, `login-banner`,
  `mypage-item-profile`/`-editInfo`/`-account`, `tab-records`(게이트)

## 상호작용
- 코스 카드 본문 → openCourseConfirm(course); i-버튼 → 팝업; 만들기 → openCourseSearch.
- 기록 탭 → guard('recordsTab'); 비로그인 차단 시 시트.
- 마이페이지 배너 탭 → 시트; 게이트 항목 → guard.
- 코스 목록 빈/에러 → AsyncBoundary Empty/에러+재시도.
- 이미지 실패 → placeholder.

## 통합
- TanStack Query + courseRepository/regionRepository(apiClient→MSW/실).
- BridgeService(openCourseSearch/openCourseConfirm). useGate/useAuth(U1).
