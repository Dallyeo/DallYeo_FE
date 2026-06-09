# Integration Test Instructions

> 단위 간 상호작용 검증. 현재 자동화 통합 테스트는 컴포넌트+스토어+브릿지 mock 수준에서 단위 테스트로 일부 커버.

## 현재 커버되는 통합 지점 (단위 테스트 내)
- 로그인 시트 → useAuth → authRepository → BridgeService(mock) → sessionStore (LoginBottomSheet.test)
- 탭바 게이트 → useGate → gateRules + sessionStore + loginSheetStore (BottomTabBar.test)
- 코스 카드 → BridgeService.openCourseConfirm (CourseCard.test)
- 마이페이지 배너/게이트 → useGate + sessionStore (MyPageView.test)
- apiClient 401 → onUnauthorized 콜백 (apiClient.test) / SessionService 무효화 1회 (SessionService.test)

## 권장 추가(후속, E2E)
- Playwright 등으로 실제 라우팅 흐름 E2E: 최초 실행→온보딩→메인, 게이트→로그인→재개, 세션 만료→메인+토스트.
- MSW 브라우저 모드로 백엔드 mock 한 채 시나리오 검증.
- 디바이스 WebView에서 실제 네이티브 브릿지 연동 수동 검증(login/openCourseSearch/sessionChanged).

## 수동 통합 체크리스트 (브라우저, pnpm dev)
- [ ] 최초 진입 → /onboarding 리다이렉트 → 완료/건너뛰기 → /main, 재실행 시 온보딩 미표시
- [ ] 비로그인 기록 탭 → 로그인 시트 / 로그인(mock) → 기록 이동
- [ ] ?mockLogin=cancel/fail 로 취소·실패 분기 확인
- [ ] 마이페이지 비로그인 배너/항목 게이트, 로그인 시 배너 숨김
- [ ] 메인 추천 코스(MSW) 로딩/표시, i-버튼 팝업, 코스 만들기(브릿지 mock)
