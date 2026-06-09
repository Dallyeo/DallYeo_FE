# U2 Onboarding — Business Logic Model

> 단위: U2. 온보딩 상태/흐름 + 컴포넌트.

## 모듈 (예정 위치)
| 모듈 | 위치 | 책임 |
|---|---|---|
| `onboardingRepository` | `features/onboarding/api/onboardingRepository.ts` | localStorage getState/saveProfile/markCompleted |
| `onboardingStore` | `features/onboarding/model/onboardingStore.ts` | step + 입력값(raw 키/체중/성별) |
| `useOnboarding` | `features/onboarding/model/useOnboarding.ts` | 단계 진행·검증·권한·완료/건너뛰기 |
| `OnboardingFlow` 등 UI | `features/onboarding/ui/` | 단계별 화면 |

## 흐름 (텍스트)
```
RootLayout bootstrap: getState().completed === false -> navigate('/onboarding')
/onboarding:
  intro -[다음]-> permission -[요청/스킵]-> bodyInfo
  bodyInfo:
    setHeight/Weight (하드 차단 입력) / setGender
    canSubmit = isProfileComplete(profile)
    [입력 완료] -> saveProfile + markCompleted -> /main
    [건너뛰기] -> markCompleted -> /main
  permission:
    requestLocation -> BridgeService.requestPermission('location')
      denied/blocked -> 제한 안내, 진행 가능
```

## 검증 로직 (U0 재사용)
- 입력 onChange: 숫자/자릿수 필터(하드). 표시용 소프트 경고는 isHeight/WeightInRange.
- canSubmit = isProfileComplete.

## 테스트 대상 (example 중심)
- onboardingRepository(localStorage round-trip, completed 플래그)
- useOnboarding(단계 전이, canSubmit 파생, skip/complete)
- 입력 필터(하드/소프트 분리) — domain.logic은 U0가 property 커버
