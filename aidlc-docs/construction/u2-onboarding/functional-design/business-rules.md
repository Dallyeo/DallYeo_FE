# U2 Onboarding — Business Rules

> CONSTRUCTION / Functional Design (단위: U2). FR-V01. U0 profileValidation 재사용.

## BR-U2-1. 1회 표시 (V01-S1, FR-V01-01)
- OnboardingRepository.getState().completed === true면 온보딩 미표시.
- RootLayout 부트스트랩 시 미완료 + 현재 경로가 온보딩 아님 → /onboarding 리다이렉트(1회).
- completed는 localStorage 키 `dallyeo.onboarding.completed`.

## BR-U2-2. 단계 진행 (V01-S1, FR-V01-02)
- 순서: intro → permission → bodyInfo. onboardingStore.step.
- 뒤로/다음 이동 가능. bodyInfo에서 완료/건너뛰기로 종료.

## BR-U2-3. 위치 권한 (V01-S2, FR-V01-03)
- permission 단계에서 BridgeService.requestPermission('location').
- granted/denied/blocked 무관하게 다음 단계 진행 가능.
- denied/blocked면 "위치 기능이 제한될 수 있어요" 안내 표시(비차단).

## BR-U2-4. 기본 정보 입력/검증 (V01-S3, FR-V01-04~07/09)
- 키/체중: 입력 단계에서 비정수·4자리+ 차단(하드, U0 profileValidation).
- 범위 밖(키 50~250 / 체중 20~300)은 소프트 경고만(비차단).
- 성별 4옵션(남/여/기타/선택안함), 'unspecified'도 채워진 값.
- "입력 완료" 버튼은 isProfileComplete일 때만 활성 → 탭 시 저장 후 /main.

## BR-U2-5. 건너뛰기 (V01-S4, FR-V01-08)
- 프로필 미저장 + markCompleted → /main.

## BR-U2-6. 완료 처리
- 완료/건너뛰기 공통: OnboardingRepository.markCompleted() → 재실행 시 미표시(BR-U2-1).
- 완료 시 프로필 저장(saveProfile), 건너뛰기 시 미저장.

## 예외
| 상황 | 규칙 |
|---|---|
| 권한 거부 | 진행 허용 + 제한 안내 |
| 잘못된 키/체중 | 하드 차단(입력 거부) + 버튼 비활성 |
| 범위 밖 값 | 소프트 경고만 |
| localStorage 접근 불가 | completed=false로 간주(온보딩 표시), 저장 실패는 무시(비차단) |
