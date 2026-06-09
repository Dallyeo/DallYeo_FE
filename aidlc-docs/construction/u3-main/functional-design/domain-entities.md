# U3 Main — Domain Entities (보강)

> 단위: U3. U0 타입 재사용.

## 재사용 (U0)
- `Course`, `Region` (domain/types) · `resolveDefaultRegion` (domain/logic) · `GateAction`/`isAllowed`

## U3 신규(전송/UI)
| 항목 | 정의 |
|---|---|
| API 응답 | `Course[]`(listRecommended), `Region[]`(listSupported) — domain 타입 그대로 |
| `regionStore` | `{ region: Region; setRegion(code) }` (선택 지역, application) |
| MSW 핸들러 | `GET /courses?regionCode=`, `GET /regions` mock |

## 관계
- regionStore.region.code → useRecommendedCourses(regionCode) 쿼리 키
- Course.regionCode ↔ Region.code
