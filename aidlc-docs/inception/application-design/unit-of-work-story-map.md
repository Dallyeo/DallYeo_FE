# Unit of Work — Story Map (Login · V01 · V02)

> Units Generation 산출물. 13개 사용자 스토리를 단위에 배정. 모든 스토리 배정 확인.

---

## 1. 스토리 ↔ 단위 매핑

| 단위 | 스토리 | 제목 | FR |
|---|---|---|---|
| **U1 Login** | LOGIN-S1 | 게이트 액션 시 로그인 바텀시트 자동 노출 | FR-LOGIN-02/03 |
| **U1 Login** | LOGIN-S2 | Kakao / Apple 소셜 로그인 | FR-LOGIN-01/05 |
| ~~U1~~ → **U3 Main** ✅ | LOGIN-S3 | 마이페이지 상단 "로그인하세요" 배너 | FR-LOGIN-04 |
| **U1 Login** | LOGIN-S4 | 세션 만료 / 로그아웃 처리 | FR-LOGIN-06 |
| **U2 Onboarding** | V01-S1 | 최초 실행 시 온보딩 1회 표시 | FR-V01-01/02 |
| **U2 Onboarding** | V01-S2 | 위치 권한 요청 단계 | FR-V01-03 |
| **U2 Onboarding** | V01-S3 | 기본 정보 입력(키/체중/성별) + 검증 | FR-V01-04~07/09 |
| **U2 Onboarding** | V01-S4 | 온보딩 건너뛰기 | FR-V01-08 |
| **U3 Main** | V02-S1 | 메인뷰 진입 & 추천 코스 리스트 | FR-V02-01/08 |
| **U3 Main** | V02-S2 | 하단 탭바 네비게이션 & 게이트 | FR-V02-02/03/04 |
| **U3 Main** | V02-S3 | 코스 만들기 / 코스 확인(네이티브 진입) | FR-V02-05/06 |
| **U3 Main** | V02-S4 | 지역 선택기(군산 한정, 확장 가능) | FR-V02-08 |
| **U3 Main** | V02-S5 | 추천 코스 i-버튼 정적 미리보기 팝업 | FR-V02-07 |

---

## 2. U0 Foundation — 스토리 직접 보유 없음 (의도)

U0는 인프라 토대로, 직접 스토리는 없으나 **모든 스토리가 의존**:
- domain 타입/로직 → 전 스토리의 데이터 계약 + 검증/세션/게이트/지역 로직
- app 셸/라우터/탭바/safe-area → 전 화면의 호스트
- 디자인 토큰 → 전 화면의 스타일

> 일부 스토리의 횡단 요소가 U1에서 도입되는 공통 인프라에 걸침(예: LOGIN-S4의 세션 단일 출처는 U1에서 도입한 SessionService). 이는 Q3=B(점진 인프라)에 따른 의도된 배치이며, 해당 스토리는 여전히 U1 소유.

> **조정(U1 Functional Design, 2026-06-09, Q6=C)**: LOGIN-S3(마이페이지 "로그인하세요" 배너)는 마이페이지 화면 연결 시점이 U3이므로 **U3로 재배정**. U1은 로그인 시트/인증 인프라/게이트 메커니즘(LOGIN-S1/S2/S4)을 구현하고, 게이트 트리거 지점(기록 탭·마이페이지 항목)의 실제 연결은 U3(V02-S2)에서 수행.

---

## 3. 단위별 스토리 수 & 커버리지

| 단위 | 스토리 수 |
|---|:--:|
| U0 Foundation | 0 (인프라) |
| U1 Login | 4 |
| U2 Onboarding | 4 |
| U3 Main | 5 |
| **합계** | **13** |

- [x] 전체 13개 스토리 모두 단위 배정 완료
- [x] 누락/중복 배정 없음
- [x] FR 23개 → 스토리 → 단위 추적 가능 (stories.md FR 커버리지 + 본 매핑)

---

## 4. 단위별 횡단 NFR 적용 예고 (Construction 입력)

| 단위 | 주요 적용 NFR/Extension |
|---|---|
| U0 | NFR-UI(토큰), NFR-WEBVIEW(셸/safe-area), PBT-01(domain logic property) |
| U1 | NFR-AUTH-01~03, SECURITY-08/11/12, NFR-BRIDGE, FR-LOGIN-06 |
| U2 | SECURITY-05(입력검증), NFR-BRIDGE(권한), PBT(profileValidation) |
| U3 | NFR-DATA-01/02, SECURITY-15(예외처리/AsyncBoundary), NFR-BRIDGE(코스 전환) |
