# U3 Main — Business Logic Model

> 단위: U3.

## 모듈
| 모듈 | 위치 | 책임 |
|---|---|---|
| `courseRepository` | features/main/api | apiClient GET /courses (MSW/실) |
| `regionRepository` | features/main/api | apiClient GET /regions |
| `regionStore` | features/main/model | 선택 지역(기본 군산) |
| `useRecommendedCourses` | features/main/model | TanStack Query(코스) |
| `useRegions` / `useSelectedRegion` | features/main/model | 지역 목록/선택 |
| `AsyncBoundary` | shared/ui | 로딩/에러/빈 상태 |
| MSW | shared/mocks | 핸들러 + 워커 시작 |

## 흐름
```
MainView -> useSelectedRegion().region.code
  -> useRecommendedCourses(code) [TanStack Query -> courseRepository -> apiClient -> MSW/실]
  -> AsyncBoundary(isLoading/isError/empty) -> CourseCard 리스트
CourseCard 본문 탭 -> BridgeService.openCourseConfirm(course)
CourseCard i-버튼 -> CoursePreviewPopup(설명+정적이미지)
CreateCourseButton -> BridgeService.openCourseSearch()
BottomTabBar 기록 탭 -> useGate.guard('recordsTab')
MyPage(비로그인) -> LoginBanner + 게이트 항목
```

## 테스트 대상(example)
- courseRepository/regionRepository(fetch mock 또는 MSW)
- regionStore 기본/선택
- AsyncBoundary 상태 렌더
- BottomTabBar 게이트(기록 탭 비로그인 차단)
- CourseCard 상호작용(openCourseConfirm 호출)
- 도메인 property(resolveDefaultRegion)는 U0 커버
