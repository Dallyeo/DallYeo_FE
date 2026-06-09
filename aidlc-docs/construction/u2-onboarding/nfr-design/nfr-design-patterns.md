# U2 Onboarding — NFR Design Patterns

> 단위: U2. U0/U1 패턴 상속 + U2 적용.

## U2-P1. 영속화 패턴 (localStorage)
- `onboardingRepository`가 localStorage 접근을 캡슐화. try/catch로 접근 실패 시 폴백(completed=false, 저장 무시).
- 키 네임스페이스 `dallyeo.onboarding.*`. JSON 직렬화.

## U2-P2. 입력 검증 분리 (하드/소프트)
- 하드(차단): onChange 단계에서 비정수/자릿수 필터 → state 미반영.
- 소프트(경고): 범위 밖이면 경고 컴포넌트 표시, 제출 비차단(U0 isHeight/WeightInRange).

## U2-P3. 권한 회복력
- requestPermission 결과 무관 진행(BR-U2-3). 거부 시 안내만.

## U2-P4. 라우팅 가드
- RootLayout 부트스트랩에서 completed 확인 → 미완료 1회 리다이렉트. 무한 리다이렉트 방지(현재 경로가 /onboarding면 스킵).

## 상속
- 에러경계(P-1), safe-area/WebView(U0), 테스트 코로케이션(P-6).

## N/A
- 서버/인프라 패턴 N/A.
