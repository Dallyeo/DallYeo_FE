# U3 Main — Logical Components (NFR)

> 단위: U3.

| 컴포넌트 | 위치 | NFR 책임 | 패턴 |
|---|---|---|---|
| `AsyncBoundary` | shared/ui | 로딩/에러/빈 상태 표준 | U3-P1 |
| `courseRepository`/`regionRepository` | features/main/api | apiClient 경유 데이터 | U3-P2 |
| MSW handlers/worker | shared/mocks | mock 백엔드 | U3-P2 |
| `CoursePreviewPopup` | features/main/ui | 이미지 폴백 + history 팝업 | U3-P3 |
| `BottomTabBar`(게이트) | app | 기록 탭 가드 | U3-P4 |
| `regionStore` | features/main/model | 선택 지역 | — |

## 회복 시나리오
| 상황 | 처리 |
|---|---|
| 코스 빈/에러 | AsyncBoundary empty/에러+재시도 |
| 이미지 실패 | placeholder |
| 비로그인 기록 탭 | guard → 시트 |
| 백엔드 미준비 | MSW mock |

## 검증
- [x] NFR 패턴 컴포넌트 대응 / 인프라성 N/A / Mermaid 미사용
