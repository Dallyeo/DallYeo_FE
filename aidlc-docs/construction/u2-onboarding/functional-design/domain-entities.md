# U2 Onboarding — Domain Entities (보강)

> 단위: U2. U0 타입 재사용 + 저장 키.

## 재사용 (U0)
- `OnboardingProfile`, `OnboardingState`, `Gender`, `PermissionStatus` (domain/types)
- `isValidHeight/Weight`, `isHeightInRange/isWeightInRange`, `isProfileComplete` (domain/logic)

## U2 신규
| 항목 | 정의 |
|---|---|
| `OnboardingStep` | `'intro' \| 'permission' \| 'bodyInfo'` (UI 상태, features/onboarding) |
| localStorage 키 | `dallyeo.onboarding.completed`(boolean), `dallyeo.onboarding.profile`(JSON) |

## 관계
- OnboardingState(completed/profile) ← localStorage 영속(비민감).
- bodyInfo 입력 → OnboardingProfile → isProfileComplete → 제출 활성.
