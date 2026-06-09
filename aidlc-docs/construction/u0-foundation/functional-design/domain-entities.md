# U0 Foundation — Domain Entities

> CONSTRUCTION / Functional Design 산출물 (단위: U0). 기술 비종속 도메인 엔티티/타입 + 관계.
> 이 타입들은 백엔드·네이티브와의 **계약**이며 `src/domain/types/`에 위치.

---

## 1. 엔티티/타입 정의

### 인증 (Auth)
| 타입 | 필드 | 비고 |
|---|---|---|
| `AppSession` | `userId: string` · `displayName?: string` · `expiresAt?: string(ISO)` | 토큰은 포함하지 않음(메모리 보관, 네이티브 단일 출처). NFR-AUTH-02 |
| `AuthStatus` | `'unknown' \| 'authenticated' \| 'unauthenticated'` | 초기값 `'unknown'` (Q4=A) |
| `AuthProvider` | `'kakao' \| 'apple'` | MVP1, google 제외 (FR-LOGIN-01) |

### 온보딩 (Onboarding)
| 타입 | 필드 | 비고 |
|---|---|---|
| `Gender` | `'male' \| 'female' \| 'other' \| 'unspecified'` | 4옵션, 'unspecified'=선택안함 (FR-V01-07) |
| `OnboardingProfile` | `heightCm?: number` · `weightKg?: number` · `gender?: Gender` | 전부 optional(건너뛰기 가능) |
| `OnboardingState` | `completed: boolean` · `profile?: OnboardingProfile` | completed=완료 또는 건너뛰기 (FR-V01-01/08) |

### 권한 (Permission)
| 타입 | 값 |
|---|---|
| `PermissionType` | `'location' \| 'notification'` |
| `PermissionStatus` | `'granted' \| 'denied' \| 'blocked' \| 'undetermined'` |

### 코스/지역 (Course / Region)
| 타입 | 필드 | 비고 |
|---|---|---|
| `Region` | `code: string` · `name: string` | code는 string(하드코딩 금지). 기본 군산. NFR-DATA-02 |
| `Course` | `id: string` · `title: string` · `description: string` · `distanceKm: number` · `estimatedTime: string` · `previewImageUrl: string` · `regionCode: string` | 정적 미리보기 이미지 URL(지도 SDK 아님). FR-V02-07 |

### 게이트 (Gate)
| 타입 | 값 |
|---|---|
| `GateAction` | `'recordsTab' \| 'myPageTab' \| 'myPageProfile' \| 'myPageEditInfo' \| 'myPageAccount' \| 'saveRunResult'` | 액션 단위 게이트 (Q6=A) |

### 공유/외부 (Shared)
| 타입 | 필드 |
|---|---|
| `SharePayload` | `title?: string` · `text?: string` · `url?: string` |

### 예약 (Reserved — 본 라운드 미구현)
| 타입 | 비고 |
|---|---|
| `RunResult` | V10 완주결과 placeholder. 필드는 V10 라운드에서 확정. (CLAUDE.md, Q5/Units 제외 정책) |

---

## 2. 상수
| 상수 | 값 | 근거 |
|---|---|---|
| `DEFAULT_REGION_CODE` | `'gunsan'` (군산) | FR-V02-08 기본 지역. regionLogic이 참조 |
| `HEIGHT_DIGIT_MIN / MAX` | 2 / 3 | Q2=B (키 2~3자리) |
| `WEIGHT_DIGIT_MIN / MAX` | 2 / 3 | FR-V01-06 |
| `HEIGHT_RANGE_CM` | 50 ~ 250 (소프트 경고) | Q1=B (비차단 권장 범위) |
| `WEIGHT_RANGE_KG` | 20 ~ 300 (소프트 경고) | Q1=B |

---

## 3. 엔티티 관계
```
AppSession ──(있으면)──> AuthStatus = authenticated
OnboardingState.profile ──contains──> OnboardingProfile { Gender }
Course.regionCode ──refs──> Region.code
GateAction ──evaluated-by──> gateRules(AuthStatus, GateAction)
```
- 모든 타입은 순수 데이터(메서드 없음). 행위는 `domain/logic/`의 순수 함수가 담당(business-rules.md).
- domain은 외부 의존 없음(레이어 규칙).
