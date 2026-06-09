# U2 Onboarding — Frontend Components

> 단위: U2. V01 온보딩 UI.

## 계층
```
OnboardingFlow (라우트 /onboarding, 탭바 없음)
  ├─ ServiceIntroStep      (서비스 소개 + [다음])
  ├─ LocationPermissionStep(권한 요청 + [허용 요청]/[건너뛰기] + 제한 안내)
  └─ BodyInfoStep          (키/체중/성별 입력 + [입력 완료]/[건너뛰기])
```

## 명세
### OnboardingFlow
- useOnboarding 사용. step에 따라 하위 단계 렌더. data-testid="onboarding-flow".

### ServiceIntroStep
- [다음] data-testid="onboarding-intro-next" → step=permission.

### LocationPermissionStep
- [위치 권한 허용] data-testid="onboarding-permission-request" → requestLocation.
- 결과 denied/blocked → 제한 안내(data-testid="onboarding-permission-limited").
- [다음/건너뛰기] data-testid="onboarding-permission-next" → step=bodyInfo.

### BodyInfoStep
- 키 입력 data-testid="onboarding-height-input" (inputMode numeric, 하드 필터)
- 체중 입력 data-testid="onboarding-weight-input"
- 성별 선택 data-testid="onboarding-gender-{male|female|other|unspecified}"
- 소프트 범위 경고 data-testid="onboarding-height-warning"/"onboarding-weight-warning"
- [입력 완료] data-testid="onboarding-submit" (isProfileComplete 시만 활성)
- [건너뛰기] data-testid="onboarding-skip"

## 상호작용
- 입력 onChange: 숫자만/3자리 제한(하드). 범위 밖이면 경고 표시(비차단).
- 제출/건너뛰기 → markCompleted → navigate('/main').

## 통합
- BridgeService.requestPermission (권한). 백엔드 호출 없음(localStorage). U0 profileValidation 검증.
