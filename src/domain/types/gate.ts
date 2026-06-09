/**
 * 게이트 액션 (FR-LOGIN-03, FR-V02-03/04). 액션 단위 게이트 (FD Q6).
 * - myPageTab: 탭 진입 자체는 항상 허용
 * - 그 외: 비로그인 시 차단 → 로그인 바텀시트
 */
export type GateAction =
  | 'recordsTab'
  | 'myPageTab'
  | 'myPageProfile'
  | 'myPageEditInfo'
  | 'myPageAccount'
  | 'saveRunResult';
