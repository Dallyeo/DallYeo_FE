# U3 Main — NFR Design Patterns

> 단위: U3. U0/U1 패턴 상속 + U3.

## U3-P1. AsyncBoundary 패턴 (P-1 확장, SECURITY-15)
- `<AsyncBoundary query={...} loading error empty>`: TanStack Query 결과(isLoading/isError/data)로 분기. 빈 배열 → empty 슬롯. 에러 → 재시도(refetch).

## U3-P2. Mock 백엔드 패턴 (NFR-DATA-01)
- MSW handlers(courses/regions). `env.enableMsw`면 워커 시작(main.tsx). 준비된 엔드포인트는 핸들러 제거로 passthrough.

## U3-P3. 이미지 폴백 패턴
- `<img onError>` → placeholder 상태. 설명 텍스트 독립 렌더.

## U3-P4. 게이트 연결 패턴 (V02-S2)
- BottomTabBar onClick: 기록 탭은 guard로 가드 후 navigate. 비로그인 차단 시 preventDefault + 시트.

## 상속
- 시트/팝업 history(P-7/NFR-WEBVIEW-04), 회복력(P-2), 토큰/세션(U1), 테스트 코로케이션.

## N/A
- 서버/인프라 패턴 N/A.
