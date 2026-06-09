# U3 Main — Business Rules

> 단위: U3 (V02 메인뷰) + LOGIN-S3(마이페이지 배너). FR-V02, FR-LOGIN-04.

## BR-U3-1. 메인뷰 진입 & 추천 코스 (V02-S1, FR-V02-01)
- 진입 시 추천 코스 카드 리스트 + 지역 선택기 + "코스 만들기" + 하단 탭바 표시.
- 코스 목록: 선택 지역(regionCode)로 CourseRepository.listRecommended → TanStack Query.
- 상태: 로딩=Spinner, 에러=재시도, 빈 목록=Empty 안내(AsyncBoundary). 다른 UI는 정상 동작.

## BR-U3-2. 지역 선택기 (V02-S4, FR-V02-08)
- 기본 지역=resolveDefaultRegion(목록)=군산. MVP는 군산만(선택 UI 노출, 선택지 1개).
- regionCode는 동적(하드코딩 금지). RegionRepository.listSupported.

## BR-U3-3. 탭바 게이트 (V02-S2, FR-V02-02/03/04)
- 탭: 메인/기록/마이페이지(업적 없음).
- 기록 탭: 비로그인 → useGate.guard('recordsTab')=false → 로그인 시트, 이동 차단. 로그인 → /records.
- 마이페이지 탭: 항상 진입 허용(myPageTab).

## BR-U3-4. 마이페이지 배너 + 게이트 항목 (LOGIN-S3, FR-V02-04, FR-LOGIN-04)
- 비로그인: 상단 "로그인하세요" 배너 표시 → 탭 시 로그인 시트.
- 프로필/내정보수정/계정관리 항목: 비로그인 시 비활성, 탭 시 useGate.guard → 시트.
- 로그인: 배너 숨김, 항목 활성(실제 설정 기능은 범위 밖 — 자리만).

## BR-U3-5. 네이티브 코스 진입 (V02-S3, FR-V02-05/06)
- "코스 만들기" → BridgeService.openCourseSearch().
- 추천 코스 카드 본문 탭 → BridgeService.openCourseConfirm(course).

## BR-U3-6. i-버튼 미리보기 팝업 (V02-S5, FR-V02-07)
- 카드 i-버튼 → 팝업(history 엔트리): 설명 + 정적 경로 이미지(지도 SDK 금지).
- 이미지 로드 실패 → placeholder, 설명은 정상.
- 좌측 스와이프/닫기로 닫힘.

## 예외
| 상황 | 규칙 |
|---|---|
| 코스 목록 빈/에러 | Empty/에러+재시도(AsyncBoundary) |
| 이미지 로드 실패 | placeholder |
| 비로그인 기록 탭 | 시트 + 차단 |
| 지역 목록 비어있음 | resolveDefaultRegion placeholder(군산) |
